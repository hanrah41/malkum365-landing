const submitBtn = document.getElementById("submitBtn");

submitBtn.addEventListener("click", function () {
  const name = document.getElementById("userName").value.trim();
  const phone = document.getElementById("userPhone").value.trim();

  if (!name) {
    alert("성함을 입력해 주세요.");
    return;
  }

  if (!phone) {
    alert("연락처를 입력해 주세요.");
    return;
  }

  const leadData = {
    name: name,
    phone: phone,
    score: window.memoryGameScore || 0,
    createdAt: new Date().toISOString()
  };

  console.log("상담 신청 데이터:", leadData);

  alert("상담 신청이 접수되었습니다.");

  document.getElementById("userName").value = "";
  document.getElementById("userPhone").value = "";
});