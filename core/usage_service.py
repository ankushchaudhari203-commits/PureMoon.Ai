from core.session_manager import SessionManager

session_manager = SessionManager()

def check_and_track_usage(session_id: str):

    count = session_manager.increment_usage(session_id)

    print("🔥 SESSION:", session_id)
    print("🔥 COUNT:", count)
    print("🔥 LIMIT:", session_manager.limit)

    if count > session_manager.limit:
        print("🚨 LIMIT EXCEEDED 🚨")
        return True  # limit exceeded

    return False  # allowed