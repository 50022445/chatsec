import re
from playwright.sync_api import expect, sync_playwright
import pytest
import time

IP = '10.10.0.123'
PORT = '4001'

@pytest.fixture(scope="function")
def setup():
    with sync_playwright() as playwright:
        browser = playwright.firefox.launch(headless=True)

        context_alice = browser.new_context(ignore_https_errors=True)
        page_alice = context_alice.new_page()
        page_alice.goto(f"https://{IP}:{PORT}/")

        context_bob = browser.new_context(ignore_https_errors=True)
        page_bob = context_bob.new_page()

        yield {'page_alice': page_alice, 'page_bob': page_bob} 
        context_alice.close()
        context_bob.close()

def test_e2ee_conversation(setup):
    alice = setup['page_alice']
    alice.click("text='Set username'")
    alice.get_by_placeholder("Username").fill("Alice")
    alice.click("text='Submit'")
    alice.click("text='Start a chat'")
    # Wait for the URL to match the regex pattern for UUID4
    alice.wait_for_url(re.compile(r"/chat/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"))
    chatroom = alice.url

    bob = setup['page_bob']
    bob.goto(chatroom)
    bob.get_by_placeholder("Username").fill("Bob")
    bob.click("text='Submit'")
    message = "Hey Alice!"

    time.sleep(3) # Wait for the handshake to succeed
    bob.get_by_placeholder("Write a message..").fill(message)
    bob.keyboard.press('Enter')
    messages = alice.locator("div:has-text('Messages.')")
    assert messages.locator(f"text={message}").is_visible(), "The message was not sent."
