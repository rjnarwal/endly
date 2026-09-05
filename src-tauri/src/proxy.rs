use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::broadcast;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HeaderItem {
    pub key: String,
    pub value: String,
    #[serde(default)]
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MockRule {
    pub id: String,
    pub name: String,
    pub method: String,
    pub path: String,
    #[serde(rename = "statusCode")]
    pub status_code: u16,
    #[serde(default)]
    pub headers: Vec<HeaderItem>,
    pub body: String,
    #[serde(rename = "delayMs", default)]
    pub delay_ms: u64,
    #[serde(default)]
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrafficLog {
    pub id: String,
    pub timestamp: u64,
    pub method: String,
    pub url: String,
    pub path: String,
    #[serde(rename = "statusCode")]
    pub status_code: u16,
    #[serde(rename = "statusText")]
    pub status_text: String,
    #[serde(rename = "isMocked")]
    pub is_mocked: bool,
    #[serde(rename = "mockId")]
    pub mock_id: Option<String>,
    #[serde(rename = "timeMs")]
    pub time_ms: u64,
    #[serde(rename = "sizeBytes")]
    pub size_bytes: usize,
    #[serde(rename = "requestHeaders")]
    pub request_headers: HashMap<String, String>,
    #[serde(rename = "responseHeaders")]
    pub response_headers: HashMap<String, String>,
    #[serde(rename = "responseBody")]
    pub response_body: Option<String>,
    #[serde(rename = "clientIp")]
    pub client_ip: Option<String>,
}

pub struct ProxyManager {
    pub is_running: bool,
    pub port: u16,
    pub mocks: Vec<MockRule>,
    pub shutdown_tx: Option<broadcast::Sender<()>>,
}

fn get_manager() -> Arc<Mutex<ProxyManager>> {
    static mut MANAGER: Option<Arc<Mutex<ProxyManager>>> = None;
    static INIT: std::sync::Once = std::sync::Once::new();
    unsafe {
        INIT.call_once(|| {
            MANAGER = Some(Arc::new(Mutex::new(ProxyManager {
                is_running: false,
                port: 8888,
                mocks: Vec::new(),
                shutdown_tx: None,
            })));
        });
        MANAGER.as_ref().unwrap().clone()
    }
}

pub fn get_local_ip_addresses() -> Vec<String> {
    let mut ips = Vec::new();
    if let Ok(ip) = std::net::UdpSocket::bind("0.0.0.0:0") {
        if ip.connect("8.8.8.8:80").is_ok() {
            if let Ok(local_addr) = ip.local_addr() {
                ips.push(local_addr.ip().to_string());
            }
        }
    }
    if ips.is_empty() {
        ips.push("127.0.0.1".into());
    }
    ips
}

#[derive(Serialize)]
pub struct StartProxyResult {
    pub success: bool,
    pub ips: Vec<String>,
    pub port: u16,
}

#[tauri::command]
pub async fn start_proxy_server(
    app: AppHandle,
    port: u16,
    mocks: Vec<MockRule>,
) -> Result<StartProxyResult, String> {
    let manager = get_manager();
    {
        let mut mg = manager.lock().map_err(|e| e.to_string())?;
        if mg.is_running {
            if let Some(tx) = &mg.shutdown_tx {
                let _ = tx.send(());
            }
        }
        mg.port = port;
        mg.mocks = mocks.clone();
        mg.is_running = true;
    }

    let (shutdown_tx, mut shutdown_rx) = broadcast::channel(1);
    {
        let mut mg = manager.lock().map_err(|e| e.to_string())?;
        mg.shutdown_tx = Some(shutdown_tx);
    }

    let addr = format!("0.0.0.0:{}", port);
    let listener = TcpListener::bind(&addr).await.map_err(|e| e.to_string())?;

    let app_handle = app.clone();
    let manager_clone = manager.clone();

    tokio::spawn(async move {
        loop {
            tokio::select! {
                accept_res = listener.accept() => {
                    if let Ok((stream, client_addr)) = accept_res {
                        let app_inner = app_handle.clone();
                        let mg_inner = manager_clone.clone();
                        tokio::spawn(async move {
                            handle_proxy_client(stream, client_addr.to_string(), app_inner, mg_inner).await;
                        });
                    }
                }
                _ = shutdown_rx.recv() => {
                    break;
                }
            }
        }
    });

    Ok(StartProxyResult {
        success: true,
        ips: get_local_ip_addresses(),
        port,
    })
}

#[tauri::command]
pub fn stop_proxy_server() -> Result<(), String> {
    let manager = get_manager();
    let mut mg = manager.lock().map_err(|e| e.to_string())?;
    if let Some(tx) = &mg.shutdown_tx {
        let _ = tx.send(());
    }
    mg.is_running = false;
    mg.shutdown_tx = None;
    Ok(())
}

#[tauri::command]
pub fn sync_mock_rules(mocks: Vec<MockRule>) -> Result<(), String> {
    let manager = get_manager();
    let mut mg = manager.lock().map_err(|e| e.to_string())?;
    mg.mocks = mocks;
    Ok(())
}

#[tauri::command]
pub fn get_local_ips() -> Vec<String> {
    get_local_ip_addresses()
}

async fn handle_proxy_client(
    mut stream: TcpStream,
    client_ip: String,
    app: AppHandle,
    manager: Arc<Mutex<ProxyManager>>,
) {
    let mut buf = vec![0u8; 16384];
    let n = match stream.read(&mut buf).await {
        Ok(n) if n > 0 => n,
        _ => return,
    };

    let req_str = String::from_utf8_lossy(&buf[..n]);
    let mut lines = req_str.lines();
    let req_line = match lines.next() {
        Some(l) => l,
        None => return,
    };

    let parts: Vec<&str> = req_line.split_whitespace().collect();
    if parts.len() < 2 {
        return;
    }

    let method = parts[0].to_uppercase();
    let target_uri = parts[1].to_string();

    let mut req_headers = HashMap::new();
    let mut host_header = String::new();

    for line in lines {
        if line.is_empty() {
            break;
        }
        if let Some((k, v)) = line.split_once(':') {
            let key = k.trim().to_string();
            let val = v.trim().to_string();
            if key.eq_ignore_ascii_case("host") {
                host_header = val.clone();
            }
            req_headers.insert(key, val);
        }
    }

    let full_url = if target_uri.starts_with("http://") || target_uri.starts_with("https://") {
        target_uri.clone()
    } else if !host_header.is_empty() {
        format!("http://{}{}", host_header, target_uri)
    } else {
        target_uri.clone()
    };

    let start_time = std::time::Instant::now();

    // 1. Handle HTTPS CONNECT Tunnel
    if method == "CONNECT" {
        let target_host = if target_uri.contains(':') {
            target_uri.clone()
        } else {
            format!("{}:443", target_uri)
        };

        if let Ok(mut target_stream) = TcpStream::connect(&target_host).await {
            let _ = stream
                .write_all(b"HTTP/1.1 200 Connection Established\r\n\r\n")
                .await;

            let log = TrafficLog {
                id: format!("{:x}", rand_u32()),
                timestamp: current_timestamp(),
                method: "CONNECT".into(),
                url: format!("https://{}", target_host),
                path: format!("https://{}", target_host),
                status_code: 200,
                status_text: "Tunnel Established".into(),
                is_mocked: false,
                mock_id: None,
                time_ms: start_time.elapsed().as_millis() as u64,
                size_bytes: 0,
                request_headers: req_headers,
                response_headers: HashMap::new(),
                response_body: None,
                client_ip: Some(client_ip),
            };
            let _ = app.emit("proxy_traffic_event", log);

            let (mut ri, mut wi) = stream.into_split();
            let (mut ro, mut wo) = target_stream.into_split();

            let client_to_target = tokio::io::copy(&mut ri, &mut wo);
            let target_to_client = tokio::io::copy(&mut ro, &mut wi);

            let _ = tokio::select! {
                r1 = client_to_target => r1,
                r2 = target_to_client => r2,
            };
        } else {
            let _ = stream.write_all(b"HTTP/1.1 502 Bad Gateway\r\n\r\n").await;
        }
        return;
    }

    // 2. Check for matching Mock Rule
    let mocks = {
        let mg = manager.lock().unwrap();
        mg.mocks.clone()
    };

    let matched_mock = mocks.into_iter().find(|m| {
        if !m.enabled {
            return false;
        }
        if !m.method.is_empty() && m.method.to_uppercase() != method {
            return false;
        }
        let lower_url = full_url.to_lowercase();
        let lower_path = m.path.to_lowercase();
        lower_url.contains(&lower_path) || lower_url.ends_with(&lower_path)
    });

    if let Some(mock) = matched_mock {
        if mock.delay_ms > 0 {
            tokio::time::sleep(tokio::time::Duration::from_millis(mock.delay_ms)).await;
        }

        let body_bytes = mock.body.as_bytes();
        let mut resp_headers = HashMap::new();
        resp_headers.insert("Content-Type".into(), "application/json".into());
        resp_headers.insert("X-Mocked-By".into(), "Endly-Proxy".into());
        resp_headers.insert("Access-Control-Allow-Origin".into(), "*".into());

        for h in &mock.headers {
            if h.enabled {
                resp_headers.insert(h.key.clone(), h.value.clone());
            }
        }

        let response = format!(
            "HTTP/1.1 {} OK\r\nContent-Type: application/json\r\nContent-Length: {}\r\nX-Mocked-By: Endly-Proxy\r\nAccess-Control-Allow-Origin: *\r\n\r\n{}",
            mock.status_code,
            body_bytes.len(),
            mock.body
        );

        let _ = stream.write_all(response.as_bytes()).await;

        let log = TrafficLog {
            id: format!("{:x}", rand_u32()),
            timestamp: current_timestamp(),
            method: method.clone(),
            url: full_url.clone(),
            path: target_uri.clone(),
            status_code: mock.status_code,
            status_text: "OK (Endly Mock)".into(),
            is_mocked: true,
            mock_id: Some(mock.id),
            time_ms: start_time.elapsed().as_millis() as u64,
            size_bytes: body_bytes.len(),
            request_headers: req_headers,
            response_headers: resp_headers,
            response_body: Some(mock.body),
            client_ip: Some(client_ip),
        };
        let _ = app.emit("proxy_traffic_event", log);
        return;
    }

    // 3. Forward HTTP request with full query params & headers
    let client_res = reqwest::Client::builder()
        .gzip(true)
        .brotli(true)
        .deflate(true)
        .danger_accept_invalid_certs(true)
        .build();

    if let Ok(client) = client_res {
        let mut req_builder = client.request(
            reqwest::Method::from_bytes(method.as_bytes()).unwrap_or(reqwest::Method::GET),
            &full_url,
        );

        for (k, v) in &req_headers {
            let k_lower = k.to_lowercase();
            if k_lower != "proxy-connection" && k_lower != "host" {
                if let Ok(hn) = reqwest::header::HeaderName::from_bytes(k.as_bytes()) {
                    if let Ok(hv) = reqwest::header::HeaderValue::from_str(v) {
                        req_builder = req_builder.header(hn, hv);
                    }
                }
            }
        }

        if let Ok(res) = req_builder.send().await {
            let status = res.status().as_u16();
            let status_text = res.status().canonical_reason().unwrap_or("OK").to_string();

            let mut resp_headers = HashMap::new();
            for (k, v) in res.headers() {
                if let Ok(val_str) = v.to_str() {
                    resp_headers.insert(k.as_str().to_string(), val_str.to_string());
                }
            }

            let body_bytes = res.bytes().await.unwrap_or_default();
            let body_str = String::from_utf8(body_bytes.to_vec()).ok();

            let mut http_res = format!("HTTP/1.1 {} {}\r\n", status, status_text);
            for (k, v) in &resp_headers {
                if !k.eq_ignore_ascii_case("content-length") && !k.eq_ignore_ascii_case("transfer-encoding") {
                    http_res.push_str(&format!("{}: {}\r\n", k, v));
                }
            }
            http_res.push_str(&format!("Content-Length: {}\r\n\r\n", body_bytes.len()));

            let _ = stream.write_all(http_res.as_bytes()).await;
            let _ = stream.write_all(&body_bytes).await;

            let log = TrafficLog {
                id: format!("{:x}", rand_u32()),
                timestamp: current_timestamp(),
                method: method.clone(),
                url: full_url.clone(),
                path: target_uri.clone(),
                status_code: status,
                status_text,
                is_mocked: false,
                mock_id: None,
                time_ms: start_time.elapsed().as_millis() as u64,
                size_bytes: body_bytes.len(),
                request_headers: req_headers,
                response_headers: resp_headers,
                response_body: body_str,
                client_ip: Some(client_ip),
            };
            let _ = app.emit("proxy_traffic_event", log);
        } else {
            let _ = stream.write_all(b"HTTP/1.1 502 Bad Gateway\r\n\r\n").await;
        }
    }
}

fn current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}

fn rand_u32() -> u32 {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos();
    (now & 0xFFFFFFFF) as u32
}
