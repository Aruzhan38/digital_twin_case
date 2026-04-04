# Digital Twin Dashboard for Locomotive Monitoring

Прототип системы цифрового двойника локомотива для оперативного анализа телеметрии в реальном времени.

# Проблема

В условиях реальной эксплуатации машинист получает десятки разрозненных сигналов одновременно. Без правильной агрегации эти данные не дают понимания общей картины, что ведет к:

-Ошибкам в принятии решений в критических ситуациях.

-Повышенному риску отказов узлов локомотива.

-Низкой эффективности анализа пост-фактум.

# Решение
Мы разработали цифровой двойник локомотива, который преобразует «сырую» телеметрию в интерактивную модель. Система рассчитывает индекс здоровья, объясняет причины его падения и дает рекомендации, позволяя оператору сфокусироваться на главном.

### Структура проекта (Project Tree)

```text
│
├──  Digital Twin Locomotive
│   ├──  backend/                # FastAPI Application
│   │   ├── main.py                # Точка входа и маршрутизация
│   │   ├── simulator.py           # Математическая модель и генерация данных
│   │   ├── health.py              # Логика расчета Health Index
│   │   ├── websocket.py           # Управление real-time соединениями
│   │   ├── storage.py             # In-memory хранилище (History/Replay)
│   │   └── requirements.txt       # Зависимости Python
│   │
│   ├──  frontend/                # React + Vite Application
│   │   ├── src/                   # Компоненты интерфейса и логика
│   │   ├── index.html             # Основной шаблон
│   │   ├── package.json           # Зависимости и скрипты Node.js
│   │   └── .gitignore
│   │
│   ├──  docs/                   # Презентация и проектная документация
│   ├──  start.sh                # Скрипт для одновременного запуска проекта
│   └──  README.md               # Описание решения
│
├──  Features
│    ├──  Real-time telemetry: WebSocket streaming (FastAPI)
│    ├──  Health Index: Алгоритм оценки состояния (health.py)
│    ├──  Replay system: Воспроизведение истории из storage.py
│    └──  Dashboard: Интерактивная визуализация (React)
│
├──  Architecture
│    ├── Backend: Python (FastAPI, Uvicorn)
│    ├── Frontend: JavaScript (React, Recharts)
│    └── Data Flow: Simulator -> Storage -> WebSocket -> Frontend
│
├──  Как Запускать Проект 
│    ├── 1. chmod +x start.sh
│    └── 2. ./start.sh
│
└──  Tech Stack: Python, FastAPI, React, Vite, WebSockets

``` 
# Функции

Real-time telemetry: Потоковая передача данных через WebSockets.

Health Index: Визуальный индикатор состояния (0-100%) с цветовой кодировкой.

Alerts & Recommendations: Автоматическая генерация советов (например, «Снизьте обороты: риск перегрева»).

Replay System: Функция воспроизведения недавних событий для разбора инцидентов.

Dashboard: Консолидированный экран с графиками трендов и SVG-картой пути.



<img width="1280" height="726" alt="image" src="https://github.com/user-attachments/assets/02190fdf-7fa3-470e-b5ab-dd918e333a6d" />
<img width="1280" height="288" alt="image" src="https://github.com/user-attachments/assets/70fd8e7b-b37e-4071-8e9c-d596ce5a8c55" />

# Логика Индекса
Индекс рассчитывается по формуле взвешенных отклонений: 

<img width="465" height="73" alt="image" src="https://github.com/user-attachments/assets/61a92bcb-ccca-4ec5-a078-0885de875c97" />

Система реализует Explainable AI: пользователь видит вклад каждого фактора (температура, давление, ошибки) в итоговый показатель.

# Архитектура
# Backend (FastAPI)

 -генерация телеметрии 
 
 -расчёт health index
 
 -алерты и рекомендации
 
 -хранение истории (in-memory)
 
 -WebSocket streaming

# Frontend (React + Vite)

 -компонентная архитектура
 
 -real-time обновление UI
 
 -графики (Recharts)
 
 -SVG карта

# Симулятор данных

 -синтетические данные
 
 -НЕ случайные значения
 
 -реализованы зависимости:

# Детали симулятора

Симулятор не выдает случайные числа. Мы заложили логические связи:

 -Fuel Consumption: При 0% топлива скорость падает до 0.

 -Overheating: Работа на максимальных оборотах ведет к перегреву и падению Health Index.

 -Pressure Drop: Имитация неисправности тормозной системы.

# Производительность
 -Update Rate: 1–10 Гц (событий в секунду).

 -Latency: Мониторинг задержки сети в реальном времени.

 -Efficiency: Использование EMA (Exponential Moving Average) для сглаживания шумов телеметрии.
 
## Как Запустить?
Запустить backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Запустить frontend

```bash
cd frontend
npm install
npm run dev
```

# Demo
 Video: https://youtu.be/2-sez38K38g?si=UyMIEz_2AJa59tys 
 
 Live demo: 
 
 Presentation: 
