import re
from playwright.sync_api import expect, sync_playwright
import pytest
from dotenv import load_dotenv
import os

load_dotenv()
IP = os.getenv("IP")
PORT = os.getenv("PORT")


@pytest.fixture(scope="function")
def setup():
    with sync_playwright() as playwright:
        browser = playwright.firefox.launch(headless=True)
        context = browser.new_context(ignore_https_errors=True)
        page = context.new_page()
        page.goto(f"https://{IP}:{PORT}/")
        yield page
        context.close()
        browser.close()

def test_opening_page(setup):
    page = setup
    expect(page).to_have_title(re.compile("ChatSec"))

def test_set_username(setup):
    page = setup
    page.click("text='Set username'")
    page.get_by_placeholder("Username").fill("Playwright")
    page.click("text='Submit'")

def test_create_room(setup):
    page = setup
    page.click("text='Set username'")
    page.get_by_placeholder("Username").fill("Playwright")
    page.click("text='Submit'")

    page.click("text='Start a chat'")
    
    # Wait for the URL to match the regex pattern for UUID4
    page.wait_for_url(url=re.compile(r"/chat/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"))
