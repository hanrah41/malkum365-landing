// 파일명 : C:\malkum365-landing\script.js


/* =========================
   Supabase 연결
========================= */

const supabaseUrl =
"https://여기에프로젝트URL.supabase.co";

const supabaseKey =
"여기에_ANON_PUBLIC_KEY";


let supabaseClient = null;


/* =========================
   Supabase 연결 시도
========================= */

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
   버튼 찾기
========================= */

const submitBtn =
document.getElementById("submitBtn");


/* =========================
   버튼 없을 경우
========================= */

if(!submitBtn){

    console.log(
        "submitBtn 없음"
    );

}


/* =========================
   무료상담 신청
========================= */

if(submitBtn){

    submitBtn.addEventListener(
        "click",

        async ()=>{

            /* =========================
               input 자동 찾기
            ========================= */

            const inputs =
            document.querySelectorAll("input");


            if(inputs.length < 2){

                alert(
                    "input 찾기 실패"
                );

                return;
            }


            const name =
            inputs[0]
            .value
            .trim();


            const phone =
            inputs[1]
            .value
            .trim();


            /* =========================
               입력 체크
            ========================= */

            if(!name || !phone){

                alert(
                    "이름과 전화번호 입력"
                );

                return;
            }


            /* =========================
               Supabase OFF 상태
            ========================= */

            if(!supabaseClient){

                alert(
                    "Supabase 연결 필요"
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

                created_text :
                createdText,

                name :
                name,

                phone :
                phone

            })

            .select();


            if(error){

                console.log(error);

                alert(
                    "leads 저장 실패"
                );

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

                customer_id :
                customerId,

                memo : "",

                next_call_at :
                null

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

            inputs[0].value = "";
            inputs[1].value = "";


            alert(
                "상담 신청 완료"
            );

        }

    );

}
