// 파일명 : C:\malkum365-landing\script.js


/* =========================
   Supabase 연결
========================= */

const supabaseUrl =
"여기에_SUPABASE_URL";

const supabaseKey =
"여기에_SUPABASE_ANON_KEY";

const supabaseClient =
window.supabase.createClient(
    supabaseUrl,
    supabaseKey
);


/* =========================
   무료상담 신청
========================= */

const submitBtn =
document.getElementById("submitBtn");


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

        alert("이름과 전화번호를 입력하세요.");

        return;
    }


    /* =========================
       leads 저장
    ========================= */

    const createdText =
    new Date().toLocaleString("ko-KR");


    const { data, error } =

    await supabaseClient

    .from("leads")

    .insert({

        created_text : createdText,

        name : name,

        phone : phone

    })

    .select()


    if(error){

        console.log(error);

        alert("저장 실패");

        return;
    }


    console.log("leads 저장 완료");


    /* =========================
       leads id 가져오기
    ========================= */

    const leadData = data[0];

    const customerId =
    leadData.id;


    /* =========================
       notes 자동 생성
    ========================= */

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
       입력창 초기화
    ========================= */

    document
    .getElementById("name")
    .value = "";

    document
    .getElementById("phone")
    .value = "";


    alert("상담 신청 완료");

});
