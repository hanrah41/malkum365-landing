const SUPABASE_URL =
"https://pziybabogqefxzvinwarg.supabase.co";

const SUPABASE_KEY =
"여기에_anon_public_key";



// ======================================================
// 상담 신청
// ======================================================

async function submitConsultation() {

    const name =
    document.getElementById("name").value.trim();

    const phone =
    document.getElementById("phone").value.trim();



    if (!name || !phone) {

        alert("input id 확인 필요");
        return;
    }



    const now = new Date();

    const createdText =

        now.getFullYear() + "-" +
        String(now.getMonth() + 1).padStart(2, "0") + "-" +
        String(now.getDate()).padStart(2, "0") + " " +
        String(now.getHours()).padStart(2, "0") + ":" +
        String(now.getMinutes()).padStart(2, "0") + ":" +
        String(now.getSeconds()).padStart(2, "0");



    const leadData = {

        created_text: createdText,
        name: name,
        phone: phone
    };



    console.log("전송 데이터:", leadData);



    try {

        // ======================================================
        // leads 저장
        // ======================================================

        const leadResponse = await fetch(

            `${SUPABASE_URL}/rest/v1/leads`,

            {
                method: "POST",

                headers: {

                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                },

                body: JSON.stringify(leadData)
            }
        );



        const leadResult =
        await leadResponse.json();



        console.log("응답 상태:",
        leadResponse.status);

        console.log("응답 내용:",
        leadResult);



        if (!leadResponse.ok) {

            alert(
                "서버 저장 실패\n\n" +
                JSON.stringify(leadResult)
            );

            return;
        }



        // ======================================================
        // notes 자동 생성
        // ======================================================

        const notesData = {

            created_text: createdText,
            name: name,
            phone: phone,

            consultation: "",
            schedule: "",
            purchase: "",
            etc: "",

            alarm_30m: false,
            alarm_checked: false,
            today_mark: false
        };



        const notesResponse = await fetch(

            `${SUPABASE_URL}/rest/v1/notes`,

            {
                method: "POST",

                headers: {

                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(notesData)
            }
        );



        const notesResult =
        await notesResponse.json();



        console.log("notes 상태:",
        notesResponse.status);

        console.log("notes 내용:",
        notesResult);



        if (!notesResponse.ok) {

            alert(
                "notes 저장 실패\n\n" +
                JSON.stringify(notesResult)
            );

            return;
        }



        // ======================================================
        // 성공
        // ======================================================

        alert("상담 신청 완료");



        document.getElementById("name").value = "";
        document.getElementById("phone").value = "";

    }

    catch (error) {

        console.error(error);

        alert(
            "네트워크 오류\n\n" +
            error.message
        );
    }
}



// ======================================================
// CRM 알람 엔진
// ======================================================

function updateConsultingRows() {

    const rows =
    document.querySelectorAll("tr");



    const now =
    new Date();



    rows.forEach(row => {

        const scheduleCell =
        row.querySelector(".schedule-cell");



        if (!scheduleCell) return;



        const scheduleText =
        scheduleCell.innerText.trim();



        if (!scheduleText) return;



        const consultDate =
        new Date(scheduleText);



        const today =
        now.toDateString() ===
        consultDate.toDateString();



        // ======================================================
        // 오늘 상담 예정
        // ======================================================

        if (

            today &&
            now.getHours() >= 9

        ) {

            row.style.background =
            "#F5D545";
        }



        // ======================================================
        // 30분 전
        // ======================================================

        const diffMs =
        consultDate - now;

        const diffMin =
        diffMs / 1000 / 60;



        if (

            diffMin <= 30 &&
            diffMin >= 0

        ) {

            row.style.background =
            "#00C853";
        }

    });
}



// ======================================================
// 1분마다 체크
// ======================================================

setInterval(

    updateConsultingRows,

    60000
);
