PYTHON = .venv/bin/python
PIP    = .venv/bin/pip

install:
	$(PIP) install -r requirements.txt

migrate:
	$(PYTHON) manage.py migrate

run:
	$(PYTHON) manage.py runserver 8000

setup: install migrate run
