const supabaseUrl =
  "https://pzjyabogqefxzvinwarg.supabase.co";

const supabaseKey =
  "sb_publishable_VrVP0buVQ3kCBiQm88Jr5g_q61_DoK8";

const supabaseClient =
  supabase.createClient(
    supabaseUrl,
    supabaseKey
  );

/* =========================
   상담 신청
========================= */

const submitBtn =
  document.getElementById("submitBtn");

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

      alert("만 14세 이상 동의가 필요합니다.");

      return;
    }

    if (!privacyAgree) {

      alert("개인정보 동의가 필요합니다.");

      return;
    }

    submitBtn.disabled = true;

    submitBtn.innerText =
      "접수 중입니다...";

    try {

      const leadData = {

        name: name,

        phone: phone,

        score:
          window.memoryGameScore || 0,

        created_at:
          new Date().toISOString()

      };

      const { error } =
        await supabaseClient
        .from("leads")
        .insert([leadData]);

      if (error) {

        console.error(error);

        alert(
          "서버 저장 실패"
        );

        submitBtn.disabled = false;

        submitBtn.innerText =
          "무료 상담 신청하기";

        return;
      }

      alert(
        "상담 신청이 접수되었습니다."
      );

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

    } catch (err) {

      console.error(err);

      alert(
        "오류가 발생했습니다."
      );
    }

    submitBtn.disabled = false;

    submitBtn.innerText =
      "무료 상담 신청하기";

  }
);

/* =========================
   개인정보 팝업
========================= */

const privacyBtn =
  document.getElementById(
    "privacyDetailBtn"
  );

const privacyModal =
  document.getElementById(
    "privacyModal"
  );

const modalCloseBtn =
  document.getElementById(
    "modalCloseBtn"
  );

privacyBtn.addEventListener(
  "click",
  function () {

    privacyModal.style.display =
      "flex";
  }
);

modalCloseBtn.addEventListener(
  "click",
  function () {

    privacyModal.style.display =
      "none";
  }
);

privacyModal.addEventListener(
  "click",
  function (e) {

    if (
      e.target === privacyModal
    ) {

      privacyModal.style.display =
        "none";
    }
  }
);
