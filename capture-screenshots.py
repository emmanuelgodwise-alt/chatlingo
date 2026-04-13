#!/usr/bin/env python3
"""
Capture screenshots of ChatLingo app using the standalone Next.js server.
Starts the proper Next.js server, then uses Playwright to capture screenshots.
"""

import subprocess
import time
import os
import sys
import signal
import urllib.request
import urllib.error

PROJECT_DIR = "/home/z/my-project"
SCREENSHOT_DIR = "/home/z/my-project/download/screenshots"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

PORT = 3002
SERVER_URL = f"http://localhost:{PORT}"

def wait_for_server(timeout=30):
    """Wait until the server responds."""
    start = time.time()
    while time.time() - start < timeout:
        try:
            req = urllib.request.urlopen(SERVER_URL, timeout=3)
            if req.status == 200:
                return True
        except:
            pass
        time.sleep(0.5)
    return False

def main():
    # Kill any existing processes on the port
    try:
        subprocess.run(["fuser", "-k", f"{PORT}/tcp"], capture_output=True, timeout=5)
    except:
        pass
    time.sleep(1)
    
    # Start the standalone Next.js server
    env = os.environ.copy()
    env["PORT"] = str(PORT)
    env["HOSTNAME"] = "0.0.0.0"
    
    server_proc = subprocess.Popen(
        ["node", "server.js"],
        cwd=os.path.join(PROJECT_DIR, ".next/standalone"),
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        preexec_fn=os.setsid
    )
    
    print(f"Starting Next.js server on port {PORT} (PID: {server_proc.pid})...")
    
    try:
        if not wait_for_server(timeout=20):
            print("ERROR: Server did not start!")
            output = server_proc.stdout.read().decode()
            print(f"Server output: {output[-500:]}")
            return False
        
        print("Server is ready!")
        
        # Now use playwright to capture screenshots
        from playwright.sync_api import sync_playwright
        
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                args=['--no-sandbox', '--disable-setuid-sandbox']
            )
            context = browser.new_context(viewport={"width": 1440, "height": 900})
            page = context.new_page()
            
            # === Screenshot 1: Landing Page ===
            print("\n[1/5] Capturing Landing Page...")
            page.goto(SERVER_URL, wait_until="networkidle", timeout=30000)
            page.wait_for_timeout(3000)
            page.screenshot(path=os.path.join(SCREENSHOT_DIR, "01-landing-page.png"), full_page=True)
            print("  -> Saved!")
            
            # === Screenshot 2: Login Page ===
            print("[2/5] Capturing Login Page...")
            # The app is a SPA, so we need to click the login button
            try:
                # Wait for the page to fully render
                page.wait_for_selector('text=Log In', timeout=10000)
                page.click('text=Log In')
                page.wait_for_timeout(2000)
            except Exception as e:
                print(f"  Note: Could not click Log In ({e}), trying alternative...")
                try:
                    page.click('a:has-text("Log In")')
                    page.wait_for_timeout(2000)
                except:
                    pass
            
            page.screenshot(path=os.path.join(SCREENSHOT_DIR, "02-login-page.png"), full_page=True)
            print("  -> Saved!")
            
            # === Screenshot 3: Chat Interface (Logged In) ===
            print("[3/5] Logging in to capture Chat Interface...")
            try:
                # Try API login first
                import json
                login_data = json.dumps({"email": "test@test.com", "password": "password123"}).encode()
                req = urllib.request.Request(
                    f"{SERVER_URL}/api/auth/login",
                    data=login_data,
                    headers={"Content-Type": "application/json"},
                    method="POST"
                )
                try:
                    resp = urllib.request.urlopen(req, timeout=10)
                    result = json.loads(resp.read().decode())
                    token = result.get("token", result.get("access_token", ""))
                    user_id = result.get("user", {}).get("id", "")
                    
                    print(f"  -> Login successful! Token: {token[:30]}...")
                    
                    # Set token in localStorage
                    page.goto(SERVER_URL, wait_until="networkidle", timeout=15000)
                    page.evaluate('''(data) => {
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('chatlingo_user', JSON.stringify(data.user));
                    }''', {"token": token, "user": result.get("user", {})})
                    
                    page.reload(wait_until="networkidle", timeout=15000)
                    page.wait_for_timeout(4000)
                    
                    page.screenshot(path=os.path.join(SCREENSHOT_DIR, "03-chat-interface.png"), full_page=False)
                    print("  -> Saved!")
                    
                    # === Screenshot 4: Contacts Sidebar Close-up ===
                    print("[4/5] Capturing Contacts Sidebar...")
                    page.wait_for_timeout(1000)
                    page.screenshot(path=os.path.join(SCREENSHOT_DIR, "04-contacts-sidebar.png"), full_page=False)
                    print("  -> Saved!")
                    
                except urllib.error.HTTPError as he:
                    print(f"  -> API login returned {he.code}: {he.read().decode()[:200]}")
                    
                    # Fallback: try UI login
                    page.goto(SERVER_URL, wait_until="networkidle", timeout=15000)
                    page.wait_for_timeout(2000)
                    try:
                        page.click('text=Log In')
                        page.wait_for_timeout(2000)
                        email_input = page.locator('input[type="email"], input[name="email"]').first
                        if email_input.is_visible(timeout=5000):
                            email_input.fill("test@test.com")
                            password_input = page.locator('input[type="password"]').first
                            password_input.fill("password123")
                            page.click('button[type="submit"]')
                            page.wait_for_load_state("networkidle", timeout=15000)
                            page.wait_for_timeout(3000)
                            page.screenshot(path=os.path.join(SCREENSHOT_DIR, "03-chat-interface.png"), full_page=False)
                            print("  -> Saved via UI login!")
                        else:
                            raise Exception("Email input not found")
                    except Exception as e2:
                        print(f"  -> UI login also failed: {e2}")
                        raise
                        
            except Exception as e:
                print(f"  -> Could not capture chat interface: {e}")
            
            # === Screenshot 5: Full chat page scroll ===
            print("[5/5] Capturing full page scroll...")
            try:
                page.goto(SERVER_URL, wait_until="networkidle", timeout=15000)
                page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                page.wait_for_timeout(1000)
                page.screenshot(path=os.path.join(SCREENSHOT_DIR, "05-full-scroll.png"), full_page=True)
                print("  -> Saved!")
            except:
                print("  -> Skipped")
            
            browser.close()
        
        print(f"\n✓ All screenshots saved to: {SCREENSHOT_DIR}")
        for f in sorted(os.listdir(SCREENSHOT_DIR)):
            if f.endswith('.png'):
                fpath = os.path.join(SCREENSHOT_DIR, f)
                size = os.path.getsize(fpath)
                print(f"  {f} ({size/1024:.1f} KB)")
        
        return True
        
    finally:
        # Clean up server process
        try:
            os.killpg(os.getpgid(server_proc.pid), signal.SIGTERM)
        except:
            pass

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
