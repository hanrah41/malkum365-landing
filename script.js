window.addEventListener(
  "DOMContentLoaded",
  function () {

    /* =========================
       Supabase
    ========================= */

    const supabaseUrl =
      "https://pziyabogqefxzvinwarg.supabase.co";

    const supabaseKey =
      "sb_publishable_VrVP0buVQ3kCBiQm88Jr5g_q61_DoK8";

    const supabaseClient =
      supabase.createClient(
        supabaseUrl,
        supabaseKey
      );

    /* =========================
       요소
    ========================= */

    const submitBtn =
      document.getElementById(
        "submitBtn"
      );

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

    /* =========================
       개인정보 팝업
    ========================= */

    if (
      privacyBtn &&
      privacyModal
    ) {

      privacyBtn.addEventListener(
        "click",
        function () {

          privacyModal.classList.add(
            "active"
          );
        }
      );
    }

    if (
      modalCloseBtn &&
      privacyModal
    ) {

      modalCloseBtn.addEventListener(
        "click",
        function () {

          privacyModal.classList.remove(
            "active"
          );
        }
      );
    }

    if (privacyModal) {

      privacyModal.addEventListener(
        "click",
        function (e) {

          if (
            e.target === privacyModal
          ) {

            privacyModal.classList.remove(
              "active"
            );
          }
        }
      );
    }

    /* =========================
       상담 신청
    ========================= */

    if (submitBtn) {

      submitBtn.addEventListener(
        "click",
        async function () {

          const name =
            document
            .getElementById(
              "userName"
            )
            .value
            .trim();

          const phone =
            document
            .getElementById(
              "userPhone"
            )
            .value
            .trim();

          const ageAgree =
            document
            .getElementById(
              "ageAgree"
            )
            .checked;

          const privacyAgree =
            document
            .getElementById(
              "privacyAgree"
            )
            .checked;

          if (!name) {

            alert(
              "성함을 입력해 주세요."
            );

            return;
          }

          if (!phone) {

            alert(
              "연락처를 입력해 주세요."
            );

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
              "개인정보 동의가 필요합니다."
            );

            return;
          }

          submitBtn.disabled =
            true;

          submitBtn.innerText =
            "접수 중입니다...";

          try {

            const now =
              new Date();

            const koreaTime =
              now
              .toLocaleString(
                "sv-SE",
                {
                  timeZone:
                    "Asia/Seoul"
                }
              )
              .replace(
                " ",
                "        "
              );

            const leadData = {

              name: name,

              phone: phone,

              score:
                Number(
                  window.memoryGameScore || 0
                ),

              created_text:
                koreaTime

            };

            console.log(
              "전송 데이터:",
              leadData
            );

            const {
              data,
              error
            } =
              await supabaseClient
              .from("leads")
              .insert([
                leadData
              ]);

            console.log(
              "응답 데이터:",
              data
            );

            console.log(
              "응답 에러:",
              error
            );

            if (error) {

              alert(
                "서버 저장 실패"
              );

              submitBtn.disabled =
                false;

              submitBtn.innerText =
                "무료 상담 신청하기";

              return;
            }

            alert(
              "상담 신청이 접수되었습니다."
            );

            document.getElementById(
              "userName"
            ).value = "";

            document.getElementById(
              "userPhone"
            ).value = "";

            document.getElementById(
              "ageAgree"
            ).checked = false;

            document.getElementById(
              "privacyAgree"
            ).checked = false;

          } catch (err) {

            console.error(
              "catch 오류:",
              err
            );

            alert(
              "서버 연결 오류"
            );
          }

          submitBtn.disabled =
            false;

          submitBtn.innerText =
            "무료 상담 신청하기";

        }
      );
    }

  }
);
