// 파일명 : C:\malkum365-landing\script.js


/* =========================
   임시 복구용
========================= */

const supabaseUrl = "";

const supabaseKey = "";


/* =========================
   Supabase OFF 상태
========================= */

let supabaseClient = null;

if(
    supabaseUrl !== "" &&
    supabaseKey !== ""
){

    supabaseClient =
    window.supabase.createClient(
        supabaseUrl,
        supabaseKey
    );

}


/* =========================
   버튼
========================= */

const submitBtn =
document.getElementById("submitBtn");


/* =========================
   무료상담 신청
========================= */

submitBtn.addEventListener("click", async ()=>{

    const name =
    document
    .getElementById("name")
    .value
    .trim();


    const phone =
    document
    .getElementById("phone")
    .value
    .trim();


    if(!name || !phone){

        alert(
            "이름과 전화번호를 입력하세요."
        );

        return;
    }


    /* =========================
       Supabase 미연결 상태
    ========================= */

    if(!supabaseClient){

        alert(
            "Supabase 연결 전 상태입니다."
        );

        return;
    }


    const createdText =

    new Date()

    .toLocaleString("ko-KR");


    /* =========================
       leads 저장
    ========================= */

    const { data, error } =

    await supabaseClient

    .from("leads")

    .insert({

        created_text : createdText,

        name : name,

        phone : phone

    })

    .select();


    if(error){

        console.log(error);

        alert("leads 저장 실패");

        return;
    }


    console.log(
        "leads 저장 완료"
    );


    /* =========================
       notes 자동 생성
    ========================= */

    const leadData =
    data[0];


    const customerId =
    leadData.id;


    const { error:noteError } =

    await supabaseClient

    .from("notes")

    .insert({

        customer_id : customerId,

        memo : "",

        next_call_at : null

    });


    if(noteError){

        console.log(noteError);

    }

    else{

        console.log(
            "notes 자동 생성 완료"
        );

    }


    /* =========================
       입력 초기화
    ========================= */

    document
    .getElementById("name")
    .value = "";


    document
    .getElementById("phone")
    .value = "";


    alert(
        "상담 신청 완료"
    );

});
