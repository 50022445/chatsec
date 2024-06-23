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
        context = browser.new_context(ignore_https_errors=True)
        page = context.new_page()
        yield {'page': page, 'browser': browser}
        context.close()
        browser.close()

def test_room_not_found(setup):
    page = setup['page']
    dir = "chat/obviously_not_real"
    page.goto(f"https://{IP}:{PORT}/{dir}")

    error_page = page.locator("div:has-text('Sorry.')")
    assert error_page.locator(f"text='Room Not Found'").is_visible(), "The 'Room Not Found' error message failed to show."


def test_page_not_found(setup):
    page = setup['page']
    dir = "not_a_real_directory"
    page.goto(f"https://{IP}:{PORT}/{dir}")

    error_page = page.locator("div:has-text('404')")
    assert error_page.locator(f"text='Page Not Found'").is_visible(), "The '404' error message failed to show."

def test_chat_access_denied(setup):
    # Alice creates a new chat
    alice = setup['browser'].new_context(ignore_https_errors=True).new_page()
    alice.goto(f"https://{IP}:{PORT}/")
    alice.click("text='Set username'")
    alice.get_by_placeholder("Username").fill("Alice")
    alice.click("text='Submit'")
    alice.click("text='Start a chat'")
    # Wait for the URL to match the regex pattern for UUID4
    alice.wait_for_url(re.compile(r"/chat/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"))
    chatroom = alice.url

    # Bob joins the chat
    bob = setup['browser'].new_context(ignore_https_errors=True).new_page()
    bob.goto(chatroom)
    bob.get_by_placeholder("Username").fill("Bob")
    bob.click("text='Submit'")
    time.sleep(3) # Wait for the handshake to succeed

    # Geronimo can't access the chat because there are already two people in it
    geronimo = setup['browser'].new_context(ignore_https_errors=True).new_page()
    geronimo.goto(chatroom)
    error_page = geronimo.locator("div:has-text('Sorry.')")
    error = "The room you're looking for is private or doesn't exist."
    assert error_page.locator(f"text={error}").is_visible(), "The 'Room Not Found' error message failed to show."
