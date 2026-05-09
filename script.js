// 파일명 : C:\malkum365-landing\script.js


/* =========================
   버튼
========================= */

const submitBtn =
document.getElementById("submitBtn");


/* =========================
   무료 상담 신청
========================= */

submitBtn.addEventListener("click", ()=>{

    const nameInput =
    document.getElementById("name");

    const phoneInput =
    document.getElementById("phone");


    /* =========================
       input 존재 체크
    ========================= */

    if(!nameInput || !phoneInput){

        alert(
            "HTML input id 확인 필요"
        );

        console.log(
            "name 또는 phone input 없음"
        );

        return;
    }


    const name =
    nameInput.value.trim();

    const phone =
    phoneInput.value.trim();


    if(!name || !phone){

        alert(
            "이름과 전화번호 입력"
        );

        return;
    }


    alert(
        "버튼 정상 작동"
    );

});
