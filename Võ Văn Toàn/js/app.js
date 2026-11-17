const API_URL = 'http://localhost:4000/api/events';
const formatDateTime = (iso) => {
    const d = new Date(iso);
    return `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}, ${d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
};

const formEl = document.getElementById('search-form');
const inputEl = document.getElementById('keyword');
const statusEl = document.getElementById('status');
const listEl = document.getElementById('event-list');

const formatSeats = (ev) => {
    const vacant = ev.capacity - ev.registeredCount;
    return vacant > 0 ? `Còn ${vacant}/${ev.capacity} chỗ` : 'Hết chỗ';
};

const createEventCard = (ev) => {
    const isFull = ev.capacity <= ev.registeredCount;
    const card = document.createElement('article');
    card.className = 'event-card';

    const figure = document.createElement('figure');
    const img = document.createElement('img');
    img.setAttribute('src', 'img/event.svg');
    img.setAttribute('alt', ev.name);
    figure.append(img);

    const info = document.createElement('div');
    info.className = 'card-info';

    const title = document.createElement('h3');
    const link = document.createElement('a');
    link.setAttribute('href', `event-detail.html?id=${ev.id}`);
    link.textContent = ev.name;
    title.append(link);

    const timeP = document.createElement('p');
    timeP.className = 'time';
    const timeTag = document.createElement('time');
    timeTag.setAttribute('datetime', ev.startTime);
    timeTag.textContent = formatDateTime(ev.startTime);
    timeP.append(timeTag);

    const locP = document.createElement('p');
    locP.className = 'location';
    locP.textContent = ev.location;

    const seatEl = document.createElement(isFull ? 'span' : 'p');
    seatEl.className = isFull ? 'badge-full' : 'seats';
    seatEl.textContent = formatSeats(ev);

    info.append(title, timeP, locP, seatEl);
    card.append(figure, info);
    return card;
};

const renderEvents = (events) => {
    const nodes = events.map(createEventCard);
    listEl.replaceChildren(...nodes);
};

const loadEvents = async (keyword) => {
    statusEl.textContent = 'Đang tải dữ liệu...';
    try {
        const params = new URLSearchParams({ pageSize: '50' });
        const cleanKeyword = keyword.trim();
        if (cleanKeyword) {
            params.append('q', cleanKeyword);
        }

        const response = await fetch(`${API_URL}?${params.toString()}`);
        
        if (!response.ok) {
            throw new Error('Fetch failed');
        }

        const data = await response.json();

        if (data.items.length === 0) {
            statusEl.textContent = 'Không có sự kiện nào khớp từ khoá.';
            listEl.replaceChildren();
            return;
        }

        statusEl.textContent = `Tìm thấy ${data.totalCount} sự kiện`;
        renderEvents(data.items);
    } catch (err) {
        statusEl.textContent = 'Không tải được dữ liệu, vui lòng thử lại.';
        listEl.replaceChildren();
    }
};

formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    loadEvents(inputEl.value);
});

loadEvents('');