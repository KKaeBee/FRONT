const API_BASE = "http://localhost:3000";
const MAX_ID = 54; 

async function fetchAllMails() {
  try {
    const allMails = [];

    for (let id = 1; id <= MAX_ID; id++) {
      const res = await fetch(`${API_BASE}/api/notices/${id}`);
      if (!res.ok) {
        console.warn(`ID ${id} 없음 → 중단`);
        break;
      }

      const mail = await res.json();
      allMails.push(mail);
    }

    // 🔹 최신 날짜 순 정렬
    allMails.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderMailList(allMails);

  } catch (err) {
    console.error("📛 전체 메일 불러오기 실패:", err);
  }
}

function renderMailList(mails) {
  const mailList = document.querySelector('.mail-items');
  const mailCount = document.querySelector('.mail-count');

  if (!mails.length) {
    mailList.innerHTML = `<li class="no-mail">메일이 없습니다.</li>`;
    mailCount.textContent = "전체 0건";
    return;
  }

  mailList.innerHTML = mails.map(mail => `
    <li class="mail-item ${mail.is_read ? '' : 'unread'}">
      <span class="badge ${mail.source.includes('금융위') ? 'orange' : 'yellow'}">${mail.source}</span>
      <span class="mail-title">${mail.title}</span>
      <span class="mail-date">${mail.date}</span>
      <button class="mail-star ${mail.is_starred ? 'active' : ''}">
        ${mail.is_starred ? '★' : '☆'}
      </button>
    </li>
  `).join('');

  mailCount.textContent = `전체 ${mails.length}건`;
}

document.addEventListener("DOMContentLoaded", fetchAllMails);

// all mail 검색 api 호출
async function fetchSearchResults(keyword) {
  try { // 세션에서 로그인 정보 가져오기
    const departmentId = sessionStorage.getItem("department_id");
    if (!departmentId) {
      alert("로그인이 필요합니다.");
      return;
    }

    const scope = 'all';

    if (!keyword) { // 검색어가 비어 있으면 다시 전체 메일
      fetchAllMails();
      return;
    }

    const res = await fetch(`${API_BASE}/api/notices/search?department_id=${departmentId}&keyword=${encodeURIComponent(keyword)}&scope=${scope}`, {
      headers: {
        Accept: "application/json"
      }
    });

    if (!res.ok) throw new Error("검색 실패");

    const searchResults = await res.json();
    renderMailList(searchResults);

  } catch (err) {
    console.error("검색 실패:", err);
    alert("검색 중 오류가 발생했습니다.");
  }
}

// all mail 검색창 이벤트 리스너
document.addEventListener("DOMContentLoaded", () => {
  fetchAllMails();

  const searchBtn = document.querySelector('.search-btn');
  const searchInput = document.querySelector('.search-bar');

  searchBtn.addEventListener('click', () => {
    const keyword = searchInput.value.trim();
    fetchSearchResults(keyword);
  });

  // Enter 키로도 검색 가능하게
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const keyword = searchInput.value.trim();
      fetchSearchResults(keyword);
    }
  });
});
