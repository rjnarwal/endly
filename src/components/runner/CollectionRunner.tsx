import React, { useState, useRef } from 'react';
import {
  X,
  Play,
  StopCircle,
  RotateCcw,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { useCollectionStore } from '../../store/useCollectionStore';
import { useEnvironmentStore } from '../../store/useEnvironmentStore';
import { RequestItem, RunnerResult, RunnerStepResult } from '../../types';
import { dispatchHttpRequest } from '../../services/httpDispatcher';
import { executeScript } from '../../services/scriptEngine';

export const CollectionRunner: React.FC = () => {
  const { isRunnerModalOpen, closeRunnerModal, selectedCollectionForRunner, settings } =
    useWorkspaceStore();
  const { collections } = useCollectionStore();
  const { environments, activeEnvironmentId, getVariableContext } = useEnvironmentStore();

  const [selectedColId, setSelectedColId] = useState<string>(
    selectedCollectionForRunner || collections[0]?.id || ''
  );
  const [selectedEnvId, setSelectedEnvId] = useState<string>(activeEnvironmentId || '');
  const [iterations, setIterations] = useState<number>(1);
  const [delayMs, setDelayMs] = useState<number>(0);
  const [stopOnError, setStopOnError] = useState<boolean>(false);

  // Execution State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [runnerResult, setRunnerResult] = useState<RunnerResult | null>(null);
  const abortRunnerRef = useRef<boolean>(false);

  if (!isRunnerModalOpen) return null;

  const targetCollection = collections.find((c) => c.id === selectedColId);

  // Flatten requests in collection
  const allRequests: RequestItem[] = [];
  if (targetCollection) {
    allRequests.push(...(targetCollection.requests || []));
  }

  const handleStartRun = async () => {
    if (allRequests.length === 0) return;

    setIsRunning(true);
    abortRunnerRef.current = false;
    setProgressPercent(0);
    setCurrentStepIndex(0);

    const startTime = Date.now();
    const steps: RunnerStepResult[] = [];
    let passedReqs = 0;
    let failedReqs = 0;
    let totalAsts = 0;
    let passedAsts = 0;
    let failedAsts = 0;

    const totalSteps = allRequests.length * iterations;
    let completedSteps = 0;

    const targetEnv = environments.find((e) => e.id === selectedEnvId);
    let runtimeVars: Record<string, string> = {};

    for (let iter = 1; iter <= iterations; iter++) {
      for (const req of allRequests) {
        if (abortRunnerRef.current) break;

        setCurrentStepIndex(completedSteps + 1);

        // 1. Build variable context
        const varContext = {
          globals: useEnvironmentStore.getState().globalVariables,
          environment: targetEnv?.variables,
          collection: targetCollection?.variables,
          runtime: runtimeVars,
        };

        // 2. Pre-request Script
        const combinedPre = `${targetCollection?.preRequestScript || ''}\n${req.preRequestScript || ''}`;
        if (combinedPre.trim()) {
          const preRes = executeScript(combinedPre, {
            request: req,
            environmentVariables: Object.fromEntries(
              (varContext.environment || []).filter((v) => v.enabled).map((v) => [v.key, v.value])
            ),
            globalVariables: Object.fromEntries(
              (varContext.globals || []).filter((v) => v.enabled).map((v) => [v.key, v.value])
            ),
            collectionVariables: Object.fromEntries(
              (varContext.collection || []).filter((v) => v.enabled).map((v) => [v.key, v.value])
            ),
            runtimeVariables: runtimeVars,
          });
          runtimeVars = preRes.mutatedRuntime;
        }

        // 3. Dispatch HTTP request
        let responseData;
        try {
          responseData = await dispatchHttpRequest({
            request: req,
            variableContext: varContext,
            globalSettings: {
              useProxy: settings.proxyEnabled,
              proxyUrl: settings.proxyUrl,
              timeoutMs: settings.requestTimeout * 1000,
            },
          });
        } catch (err: any) {
          responseData = {
            status: 0,
            statusText: 'Failed',
            headers: {},
            cookies: [],
            body: err.message || String(err),
            sizeBytes: 0,
            timeMs: 0,
            timestamp: Date.now(),
            contentType: 'text/plain',
            isError: true,
          };
        }

        // 4. Test Script
        const combinedTests = `${targetCollection?.testScript || ''}\n${req.testScript || ''}`;
        let testSummary = { total: 0, passed: 0, failed: 0, assertions: [] as any[] };

        if (combinedTests.trim() && !responseData.isError) {
          const testRes = executeScript(combinedTests, {
            request: req,
            response: responseData,
            environmentVariables: Object.fromEntries(
              (varContext.environment || []).filter((v) => v.enabled).map((v) => [v.key, v.value])
            ),
            globalVariables: Object.fromEntries(
              (varContext.globals || []).filter((v) => v.enabled).map((v) => [v.key, v.value])
            ),
            collectionVariables: Object.fromEntries(
              (varContext.collection || []).filter((v) => v.enabled).map((v) => [v.key, v.value])
            ),
            runtimeVariables: runtimeVars,
          });
          testSummary = testRes.summary;
          runtimeVars = testRes.mutatedRuntime;
        }

        const isStepSuccess =
          !responseData.isError && responseData.status >= 200 && responseData.status < 400 && testSummary.failed === 0;

        if (isStepSuccess) passedReqs++;
        else failedReqs++;

        totalAsts += testSummary.total;
        passedAsts += testSummary.passed;
        failedAsts += testSummary.failed;

        steps.push({
          requestId: req.id,
          requestName: req.name,
          method: req.method,
          url: req.url,
          iteration: iter,
          status: responseData.status,
          statusText: responseData.statusText,
          timeMs: responseData.timeMs,
          sizeBytes: responseData.sizeBytes,
          testResults: testSummary,
          error: responseData.isError ? responseData.body : undefined,
        });

        completedSteps++;
        setProgressPercent(Math.round((completedSteps / totalSteps) * 100));

        // Update live result snapshot
        setRunnerResult({
          id: Math.random().toString(36).substring(2, 9),
          collectionName: targetCollection?.name || 'Collection Run',
          startTime,
          endTime: Date.now(),
          totalRequests: completedSteps,
          passedRequests: passedReqs,
          failedRequests: failedReqs,
          totalAssertions: totalAsts,
          passedAssertions: passedAsts,
          failedAssertions: failedAsts,
          durationMs: Date.now() - startTime,
          steps: [...steps],
        });

        if (stopOnError && !isStepSuccess) {
          abortRunnerRef.current = true;
          break;
        }

        // Delay between requests
        if (delayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
      if (abortRunnerRef.current) break;
    }

    setIsRunning(false);
  };

  const handleStopRun = () => {
    abortRunnerRef.current = true;
    setIsRunning(false);
  };

  const handleExportReport = () => {
    if (!runnerResult) return;
    const jsonStr = JSON.stringify(runnerResult, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `run_report_${targetCollection?.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-background-elevated border border-border rounded-xl shadow-2xl w-full max-w-5xl h-[650px] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-background-secondary">
          <div className="flex items-center space-x-2">
            <Play className="w-5 h-5 text-emerald-400 fill-emerald-400" />
            <h2 className="text-sm font-bold text-text">Automated Collection Runner</h2>
          </div>
          <button
            onClick={closeRunnerModal}
            className="p-1 rounded-md text-text-muted hover:text-text hover:bg-background-tertiary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content: Configuration Sidebar + Results Dashboard */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Config Panel */}
          <div className="w-72 border-r border-border bg-background-secondary p-4 flex flex-col space-y-4">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Run Settings</h3>

            {/* Collection Select */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary">Target Collection:</label>
              <select
                value={selectedColId}
                onChange={(e) => setSelectedColId(e.target.value)}
                disabled={isRunning}
                className="bg-background border border-border rounded-md px-3 py-1.5 text-xs text-text focus:outline-none focus:border-accent"
              >
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.requests?.length || 0} reqs)
                  </option>
                ))}
              </select>
            </div>

            {/* Environment Select */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary">Environment:</label>
              <select
                value={selectedEnvId}
                onChange={(e) => setSelectedEnvId(e.target.value)}
                disabled={isRunning}
                className="bg-background border border-border rounded-md px-3 py-1.5 text-xs text-text focus:outline-none focus:border-accent"
              >
                <option value="">No Environment</option>
                {environments.map((env) => (
                  <option key={env.id} value={env.id}>
                    {env.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Iterations */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary">Iterations:</label>
              <input
                type="number"
                min={1}
                max={100}
                value={iterations}
                onChange={(e) => setIterations(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={isRunning}
                className="bg-background border border-border rounded-md px-3 py-1.5 text-xs text-text focus:outline-none focus:border-accent font-mono"
              />
            </div>

            {/* Delay */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary">Delay (ms):</label>
              <input
                type="number"
                min={0}
                max={10000}
                step={50}
                value={delayMs}
                onChange={(e) => setDelayMs(Math.max(0, parseInt(e.target.value) || 0))}
                disabled={isRunning}
                className="bg-background border border-border rounded-md px-3 py-1.5 text-xs text-text focus:outline-none focus:border-accent font-mono"
              />
            </div>

            {/* Stop on Error */}
            <label className="flex items-center space-x-2 text-xs text-text cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={stopOnError}
                onChange={(e) => setStopOnError(e.target.checked)}
                disabled={isRunning}
                className="accent-accent"
              />
              <span>Stop run on first error</span>
            </label>

            {/* Actions */}
            <div className="pt-4 mt-auto flex flex-col space-y-2">
              {isRunning ? (
                <button
                  onClick={handleStopRun}
                  className="flex items-center justify-center space-x-1.5 py-2.5 px-4 rounded-md font-medium text-xs text-white bg-rose-600 hover:bg-rose-700 transition-colors"
                >
                  <StopCircle className="w-4 h-4" />
                  <span>Stop Runner</span>
                </button>
              ) : (
                <button
                  onClick={handleStartRun}
                  disabled={allRequests.length === 0}
                  className="flex items-center justify-center space-x-1.5 py-2.5 px-4 rounded-md font-medium text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Run {targetCollection?.name || 'Collection'}</span>
                </button>
              )}

              {runnerResult && (
                <button
                  onClick={handleExportReport}
                  className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-md text-xs font-medium bg-background-tertiary text-text-secondary hover:text-text transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Report (JSON)</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Results Dashboard */}
          <div className="flex-1 flex flex-col p-5 overflow-hidden">
            {/* Top Progress & Metrics */}
            {runnerResult ? (
              <div className="flex flex-col space-y-3 pb-4 border-b border-border">
                {/* Progress Bar */}
                <div className="flex flex-col space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-text">
                    <span>
                      {isRunning ? `Running Step ${currentStepIndex}...` : 'Run Finished'}
                    </span>
                    <span className="font-mono">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-background-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        runnerResult.failedRequests > 0 ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Metrics Summary Badges */}
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 rounded-lg bg-background-secondary border border-border">
                    <span className="text-lg font-bold font-mono text-text">
                      {runnerResult.totalRequests}
                    </span>
                    <span className="block text-[10px] text-text-muted uppercase">Total Requests</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <span className="text-lg font-bold font-mono text-emerald-400">
                      {runnerResult.passedRequests}
                    </span>
                    <span className="block text-[10px] text-emerald-400/80 uppercase">Passed</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30">
                    <span className="text-lg font-bold font-mono text-rose-400">
                      {runnerResult.failedRequests}
                    </span>
                    <span className="block text-[10px] text-rose-400/80 uppercase">Failed</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-background-secondary border border-border">
                    <span className="text-lg font-bold font-mono text-accent">
                      {runnerResult.passedAssertions}/{runnerResult.totalAssertions}
                    </span>
                    <span className="block text-[10px] text-text-muted uppercase">Tests Passed</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-text-muted border-b border-border">
                Configure iterations and delay on the left and click <strong>Run</strong> to execute test suites sequentially.
              </div>
            )}

            {/* Steps Execution List */}
            <div className="flex-1 overflow-y-auto pt-3 space-y-1.5">
              {runnerResult?.steps.map((step, idx) => {
                const isSuccess = step.status >= 200 && step.status < 400 && step.testResults.failed === 0;

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-lg border text-xs ${
                      isSuccess
                        ? 'bg-background-secondary/60 border-border'
                        : 'bg-rose-500/5 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      {isSuccess ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-accent font-mono text-[10px]">
                            {step.method}
                          </span>
                          <span className="font-semibold text-text truncate">{step.requestName}</span>
                          <span className="text-[10px] text-text-muted font-mono">
                            (Iter {step.iteration})
                          </span>
                        </div>
                        <span className="text-[10px] text-text-muted truncate font-mono mt-0.5">
                          {step.url}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 shrink-0 font-mono text-xs">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                          isSuccess
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}
                      >
                        {step.status || 'ERR'}
                      </span>

                      <span className="text-text-muted text-[11px]">{step.timeMs}ms</span>

                      {step.testResults.total > 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            step.testResults.failed === 0
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {step.testResults.passed}/{step.testResults.total} tests
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
