from pynput import keyboard, mouse
from pynput.keyboard import Key, Controller as KeyboardController
from pynput.mouse import Button, Controller as MouseController
import threading
import time

# Controllers for keyboard and mouse
keyboard_controller = KeyboardController()
mouse_controller = MouseController()

# State variables
clicking = False
thread = None

def click_loop():
    # Hold Shift and repeatedly left-click every second
    keyboard_controller.press(Key.shift)
    try:
        while clicking:
            mouse_controller.press(Button.left)
            mouse_controller.release(Button.left)
            time.sleep(1)
    finally:
        keyboard_controller.release(Key.shift)

def on_press(key):
    global clicking, thread
    # Detect Shift+R (case-insensitive)
    if key == keyboard.KeyCode.from_char('r') and any([k == Key.shift for k in current_keys]):
        if not clicking:
            clicking = True
            thread = threading.Thread(target=click_loop)
            thread.start()
        else:
            clicking = False
            if thread:
                thread.join()

current_keys = set()

def on_key_event(key):
    if key not in current_keys:
        current_keys.add(key)
        on_press(key)

def on_key_release(key):
    if key in current_keys:
        current_keys.remove(key)

# Listener for keyboard events
with keyboard.Listener(on_press=on_key_event, on_release=on_key_release) as listener:
    listener.join()
