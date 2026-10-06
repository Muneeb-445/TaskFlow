from apscheduler.schedulers.background import BackgroundScheduler

from app.jobs.notification_scheduler import check_task_due_dates

scheduler = BackgroundScheduler()


def start_scheduler() -> None:
    scheduler.add_job(
        check_task_due_dates,
        trigger="interval",
        hours=10,  # TEMPORARY — switch back to hours=12 after confirming it works
        id="check_task_due_dates",
        replace_existing=True,
    )
    scheduler.start()


def stop_scheduler() -> None:
    scheduler.shutdown(wait=False)