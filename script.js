const SUPABASE_URL =
  "https://pziyabogqefxzvinwarg.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_VrVP0buVQ3kCBiQm88Jr5g_q61_DoK8";

const supabaseClient =
  supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );

const submitBtn =
  document.getElementById("submitBtn");

const privacyDetailBtn =
  document.getElementById("privacyDetailBtn");

const privacyModal =
  document.getElementById("privacyModal");

const modalCloseBtn =
  document.getElementById("modalCloseBtn");

// 자세히 보기
privacyDetailBtn.addEventListener(
  "click",
  function () {

    privacyModal.style.display = "flex";
  }
);

// 팝업 닫기
modalCloseBtn.addEventListener(
  "click",
  function () {

    privacyModal.style.display = "none";
  }
);

// 팝업 바깥 클릭
privacyModal.addEventListener(
  "click",
  function (event) {

    if (event.target === privacyModal) {

      privacyModal.style.display = "none";
    }
  }
);

// 무료 상담 신청
submitBtn.addEventListener(
  "click",
  async function () {

    const name =
      document
        .getElementById("userName")
        .value
        .trim();

    const phone =
      document
        .getElementById("userPhone")
        .value
        .trim();

    const ageAgree =
      document
        .getElementById("ageAgree")
        .checked;

    const privacyAgree =
      document
        .getElementById("privacyAgree")
        .checked;

    if (!name) {

      alert("성함을 입력해 주세요.");

      return;
    }

    if (!phone) {

      alert("연락처를 입력해 주세요.");

      return;
    }

    if (!ageAgree) {

      alert(
        "만 14세 이상 동의가 필요합니다."
      );

      return;
    }

    if (!privacyAgree) {

      alert(
        "개인정보 수집·이용 동의가 필요합니다."
      );

      return;
    }

    const leadData = {

      name: name,

      phone: phone,

      score:
        window.memoryGameScore || 0
    };

    // Supabase 저장
    const { error } =
      await supabaseClient
        .from("leads")
        .insert([leadData]);

    if (error) {

      console.error(error);

      alert("상담 신청 저장 실패");

      return;
    }

    alert("무료 상담 신청 완료");

    // 입력 초기화
    document
      .getElementById("userName")
      .value = "";

    document
      .getElementById("userPhone")
      .value = "";

    document
      .getElementById("ageAgree")
      .checked = false;

    document
      .getElementById("privacyAgree")
      .checked = false;
  }
);
