const SUPABASE_URL =
"https://pziyabogqefxzvinwarg.supabase.co";

const SUPABASE_KEY =
"sb_publishable_VrVP0buVQ3kCBiQm88Jr5g_q61_DoK8";

async function saveLead(name, phone){

    const now = new Date();

    const createdText =
        now.getFullYear() + "-" +
        String(now.getMonth() + 1).padStart(2, "0") + "-" +
        String(now.getDate()).padStart(2, "0") + " " +
        String(now.getHours()).padStart(2, "0") + ":" +
        String(now.getMinutes()).padStart(2, "0") + ":" +
        String(now.getSeconds()).padStart(2, "0");

    const data = {

        created_text: createdText,
        name: name,
        phone: phone
    };

    console.log("전송 데이터:", data);

    try{

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/leads`,
            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json",
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`,
                    "Prefer": "return=minimal"
                },

                body: JSON.stringify(data)
            }
        );

        if(response.ok){

            alert("상담 신청 완료");

        }else{

            const errorText = await response.text();

            console.log(errorText);

            alert("서버 저장 실패");
        }

    }catch(error){

        console.log(error);

        alert("연결 실패");
    }
}
