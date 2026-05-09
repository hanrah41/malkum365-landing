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
   무료상담 신청
========================= */

if(submitBtn){

    submitBtn.addEventListener(

        "click",

        async ()=>{

            const inputs =
            document.querySelectorAll("input");


            if(inputs.length < 2){

                alert(
                    "input 오류"
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


            if(!name || !phone){

                alert(
                    "이름과 전화번호 입력"
                );

                return;
            }


            const createdText =

            new Date()

            .toLocaleString("ko-KR");


            /* =========================
               leads 저장
            ========================= */

            const {

                data:leadData,

                error:leadError

            } =

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
                "leads 데이터 : ",
                leadData
            );

            console.log(
                "leads 에러 : ",
                leadError
            );


            if(leadError){

                alert(
                    "leads 저장 실패"
                );

                return;
            }


            /* =========================
               notes 자동 생성
            ========================= */

            const {

                data:notesData,

                error:notesError

            } =

            await supabaseClient

            .from("notes")

            .insert({

                created_text :
                createdText,

                name :
                name,

                phone :
                phone,

                consultation : "",

                schedule : "",

                purchase : "",

                etc : ""

            })

            .select("*")

            .single();


            console.log(
                "notes 데이터 : ",
                notesData
            );

            console.log(
                "notes 에러 : ",
                notesError
            );


            if(notesError){

                alert(
                    "notes 저장 실패"
                );

                return;
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
