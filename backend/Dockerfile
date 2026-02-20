FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
RUN python manage.py collectstatic --noinput 2>/dev/null || true
CMD python manage.py migrate --noinput && python manage.py seed_trips && gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000}
