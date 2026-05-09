// 파일명 : C:\malkum365-landing\script.js


/* =========================
   Supabase 연결
========================= */

const supabaseUrl =
"https://pziyabogqefxzvinwarg.supabase.co";

const supabaseKey =
"sb_publishable_VrVP0buVQ3kCBiQm88Jr5g_q61_DoK8";


const supabaseClient =
window.supabase.createClient(
    supabaseUrl,
    supabaseKey
);


/* =========================
   버튼
========================= */

const submitBtn =
document.getElementById("submitBtn");


/* =========================
   버튼 체크
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
               입력 확인
            ========================= */

            if(!name || !phone){

                alert(
                    "이름과 전화번호 입력"
                );

                return;
            }


            /* =========================
               시간 생성
            ========================= */

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

            .select("*")

            .single();


            console.log(
                "응답 데이터 : ",
                data
            );

            console.log(
                "응답 에러 : ",
                error
            );


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
               customer id 추출
            ========================= */

            const leadData =
            data;


            const customerId =
            leadData.id;


            console.log(
                "customerId : ",
                customerId
            );


            /* =========================
               notes 자동 생성
            ========================= */

            const {

                data:noteData,

                error:noteError

            } =

            await supabaseClient

            .from("notes")

            .insert({

                customer_id :
                customerId,

                name :
                name,

                phone :
                phone,

                status : "",

                schedule : "",

                purchase : "",

                memo : "",

                next_call_at :
                null

            })

            .select("*")

            .single();


            console.log(
                "notes 응답 데이터 : ",
                noteData
            );

            console.log(
                "notes 응답 에러 : ",
                noteError
            );


            if(noteError){

                console.log(noteError);

                alert(
                    "notes 저장 실패"
                );

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
