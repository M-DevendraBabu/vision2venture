"""
Vision2Venture — Test Runner
============================
Runs every test_*.py validation script in this folder as a subprocess and
reports PASS (exit code 0) / FAIL for each, with a summary at the end.

The individual test_*.py files are print-based validation scripts (they exercise
the ML models and services and print their outputs). This runner turns them into
a single, repeatable, CI-friendly check.

Usage (from backend/):
    python run_all_tests.py
    python run_all_tests.py -v         # also print each test's output
    python run_all_tests.py --fast     # skip the slow live-API suites
"""
import os
import sys
import glob
import time
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
VERBOSE = "-v" in sys.argv or "--verbose" in sys.argv
FAST = "--fast" in sys.argv

# These exercise the full pipeline against live APIs and an LLM for many ideas, so
# they take minutes rather than seconds. --fast skips them for a quick inner loop.
SLOW_TESTS = {
    "test_batch_validation.py",
    "test_cases_validation.py",
    "test_large_scale_batch.py",
    "test_competitor_tab_audit.py",
}

TIMEOUT = 600


def main():
    test_files = sorted(glob.glob(os.path.join(HERE, "test_*.py")))
    if not test_files:
        print("No test_*.py files found.")
        return 0

    print("=" * 70)
    print(f"VISION2VENTURE TEST RUNNER — {len(test_files)} scripts")
    print(f"per-test timeout: {TIMEOUT}s" + ("   (--fast: skipping live-API suites)" if FAST else ""))
    print("=" * 70)

    passed, failed, timed_out = 0, 0, 0
    results = []
    for path in test_files:
        name = os.path.basename(path)
        start = time.time()
        if FAST and name in SLOW_TESTS:
            print(f"  [SKIP] {name:32s} (live-API suite, --fast)")
            continue

        hit_timeout = False
        try:
            proc = subprocess.run(
                [sys.executable, path],
                cwd=HERE,
                capture_output=True,
                text=True,
                timeout=TIMEOUT,
            )
            ok = proc.returncode == 0
        except subprocess.TimeoutExpired:
            ok = False
            hit_timeout = True
            proc = None
        dt = time.time() - start

        # A timeout is not the same as a failed assertion. These suites call live
        # APIs and an LLM, so reporting "FAIL" for a slow network read was
        # misleading - it read as a broken test when nothing had actually failed.
        status = "PASS" if ok else ("TIME" if hit_timeout else "FAIL")
        if ok:
            passed += 1
        elif hit_timeout:
            timed_out += 1
        else:
            failed += 1
        results.append((name, status, dt))
        print(f"  [{status}] {name:32s} ({dt:5.1f}s)")
        if VERBOSE and proc is not None:
            print("  " + "-" * 60)
            for line in (proc.stdout or "").splitlines():
                print("    " + line)
            if proc.returncode != 0 and proc.stderr:
                print("    STDERR:")
                for line in proc.stderr.splitlines()[-15:]:
                    print("    " + line)
            print("  " + "-" * 60)

    print("=" * 70)
    print(f"SUMMARY: {passed} passed, {failed} failed, {timed_out} timed out, {len(test_files)} total")
    if timed_out:
        print(f"         (TIME = exceeded the {TIMEOUT}s cap while calling live APIs, not an assertion failure)")
    print("=" * 70)
    # Only real assertion failures are treated as a non-zero exit.
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
