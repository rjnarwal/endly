use rcgen::{BasicConstraints, CertificateParams, DnType, IsCa, KeyPair};
use rustls_pki_types::{CertificateDer, PrivateKeyDer, PrivatePkcs8KeyDer};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex, RwLock};
use tauri::{AppHandle, Emitter};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::broadcast;

static CA_CERT_PEM: &str = include_str!("../../public/endly-root-ca.crt");
static CA_KEY_PEM: &str = include_str!("../../public/endly-root-ca.key");

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

type TlsConfigCache = Arc<RwLock<HashMap<String, Arc<rustls::ServerConfig>>>>;

pub struct ProxyManager {
    pub is_running: bool,
    pub port: u16,
    pub mocks: Vec<MockRule>,
    pub shutdown_tx: Option<broadcast::Sender<()>>,
    pub tls_cache: TlsConfigCache,
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
                tls_cache: Arc::new(RwLock::new(HashMap::new())),
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

// Generate dynamic SSL certificate signed by Endly Root CA
fn get_or_create_tls_config(
    domain: &str,
    cache: &TlsConfigCache,
) -> Option<Arc<rustls::ServerConfig>> {
    {
        if let Ok(r) = cache.read() {
            if let Some(cfg) = r.get(domain) {
                return Some(cfg.clone());
            }
        }
    }

    let ca_key_pair = KeyPair::from_pem(CA_KEY_PEM).ok()?;
    let mut ca_params = CertificateParams::default();
    ca_params.is_ca = IsCa::Ca(BasicConstraints::Unconstrained);
    ca_params.distinguished_name.push(DnType::CommonName, "Endly Root CA");
    ca_params.distinguished_name.push(DnType::OrganizationName, "Endly");
    let ca_cert = ca_params.self_signed(&ca_key_pair).ok()?;

    let mut params = CertificateParams::new(vec![domain.to_string(), format!("*.{}", domain)]).ok()?;
    params.distinguished_name.push(DnType::CommonName, domain);

    let server_key_pair = KeyPair::generate().ok()?;
    let cert = params.signed_by(&server_key_pair, &ca_cert, &ca_key_pair).ok()?;

    let cert_der = CertificateDer::from(cert.der().to_vec());
    let ca_cert_der = CertificateDer::from(ca_cert.der().to_vec());
    let key_der = PrivateKeyDer::Pkcs8(PrivatePkcs8KeyDer::from(server_key_pair.serialize_der()));

    let server_config = rustls::ServerConfig::builder()
        .with_no_client_auth()
        .with_single_cert(vec![cert_der, ca_cert_der], key_der)
        .ok()?;

    let config_arc = Arc::new(server_config);
    if let Ok(mut w) = cache.write() {
        w.insert(domain.to_string(), config_arc.clone());
    }

    Some(config_arc)
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

    // 1. Handle HTTPS CONNECT Tunnel with Dynamic SSL MITM Decryption
    if method == "CONNECT" {
        let raw_host = target_uri.split(':').next().unwrap_or(&target_uri).to_lowercase();
        let target_host = if target_uri.contains(':') {
            target_uri.clone()
        } else {
            format!("{}:443", target_uri)
        };

        // Pinned apple / system hosts -> transparent TCP bypass
        let is_pinned = ["apple.com", "icloud.com", "push.apple.com"].iter().any(|d| raw_host.ends_with(d));

        if is_pinned {
            if let Ok(target_stream) = TcpStream::connect(&target_host).await {
                let _ = stream.write_all(b"HTTP/1.1 200 Connection Established\r\n\r\n").await;
                let (mut ri, mut wi) = stream.into_split();
                let (mut ro, mut wo) = target_stream.into_split();
                let client_to_target = tokio::io::copy(&mut ri, &mut wo);
                let target_to_client = tokio::io::copy(&mut ro, &mut wi);
                let _ = tokio::select! {
                    r1 = client_to_target => r1,
                    r2 = target_to_client => r2,
                };
            }
            return;
        }

        // Get or dynamically generate TLS configuration for domain
        let tls_cache = {
            let mg = manager.lock().unwrap();
            mg.tls_cache.clone()
        };

        if let Some(tls_cfg) = get_or_create_tls_config(&raw_host, &tls_cache) {
            let _ = stream.write_all(b"HTTP/1.1 200 Connection Established\r\n\r\n").await;
            let acceptor = tokio_rustls::TlsAcceptor::from(tls_cfg);
            if let Ok(mut tls_stream) = acceptor.accept(stream).await {
                // Read inner decrypted HTTP requests
                let mut dec_buf = vec![0u8; 16384];
                if let Ok(dec_n) = tls_stream.read(&mut dec_buf).await {
                    if dec_n > 0 {
                        let dec_req_str = String::from_utf8_lossy(&dec_buf[..dec_n]);
                        let mut dec_lines = dec_req_str.lines();
                        if let Some(first_line) = dec_lines.next() {
                            let dec_parts: Vec<&str> = first_line.split_whitespace().collect();
                            if dec_parts.len() >= 2 {
                                let inner_method = dec_parts[0].to_uppercase();
                                let inner_path = dec_parts[1].to_string();

                                let mut inner_headers = HashMap::new();
                                for l in dec_lines {
                                    if l.is_empty() {
                                        break;
                                    }
                                    if let Some((k, v)) = l.split_once(':') {
                                        inner_headers.insert(k.trim().to_string(), v.trim().to_string());
                                    }
                                }

                                let full_decrypted_url = format!("https://{}{}", raw_host, inner_path);
                                let start_time = std::time::Instant::now();

                                // Forward decrypted request to upstream HTTPS
                                let client_res = reqwest::Client::builder()
                                    .danger_accept_invalid_certs(true)
                                    .build();

                                if let Ok(client) = client_res {
                                    let mut req_builder = client.request(
                                        reqwest::Method::from_bytes(inner_method.as_bytes()).unwrap_or(reqwest::Method::GET),
                                        &full_decrypted_url,
                                    );

                                    for (k, v) in &inner_headers {
                                        let k_lower = k.to_lowercase();
                                        if k_lower != "proxy-connection" && k_lower != "host" && k_lower != "content-length" {
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

                                        let _ = tls_stream.write_all(http_res.as_bytes()).await;
                                        let _ = tls_stream.write_all(&body_bytes).await;
                                        let _ = tls_stream.flush().await;

                                        let log = TrafficLog {
                                            id: format!("{:x}", rand_u32()),
                                            timestamp: current_timestamp(),
                                            method: inner_method,
                                            url: full_decrypted_url,
                                            path: inner_path,
                                            status_code: status,
                                            status_text,
                                            is_mocked: false,
                                            mock_id: None,
                                            time_ms: start_time.elapsed().as_millis() as u64,
                                            size_bytes: body_bytes.len(),
                                            request_headers: inner_headers,
                                            response_headers: resp_headers,
                                            response_body: body_str,
                                            client_ip: Some(client_ip.clone()),
                                        };
                                        let _ = app.emit("proxy_traffic_event", log);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return;
        }

        // Fallback transparent tunnel if cert generation fails
        if let Ok(target_stream) = TcpStream::connect(&target_host).await {
            let _ = stream.write_all(b"HTTP/1.1 200 Connection Established\r\n\r\n").await;
            let (mut ri, mut wi) = stream.into_split();
            let (mut ro, mut wo) = target_stream.into_split();
            let client_to_target = tokio::io::copy(&mut ri, &mut wo);
            let target_to_client = tokio::io::copy(&mut ro, &mut wi);
            let _ = tokio::select! {
                r1 = client_to_target => r1,
                r2 = target_to_client => r2,
            };
        }
        return;
    }

    let full_url = if target_uri.starts_with("http://") || target_uri.starts_with("https://") {
        target_uri.clone()
    } else if !host_header.is_empty() {
        format!("http://{}{}", host_header, target_uri)
    } else {
        target_uri.clone()
    };

    let start_time = std::time::Instant::now();

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

    // 3. Forward plain HTTP request with full query params & headers
    let client_res = reqwest::Client::builder()
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
