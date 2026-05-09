// ============================================
// Supabase 직접 연결
// ============================================

const supabaseClient =

window.supabase.createClient(

    "https://pziyabogqefxzvinwarg.supabase.co",

    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6aXlhYm9ncWVmeHp2aW53YXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxODQ2MjEsImV4cCI6MjA5Mzc2MDYyMX0.lNRssXB660yZxOzIIXEl3JoBAvY-0MHjsrPKsc4Q2_0"
);



// ============================================
// 요소
// ============================================

const submitBtn =
document.getElementById('submitBtn');

const nameInput =
document.getElementById('name');

const phoneInput =
document.getElementById('phone');



// ============================================
// 버튼
// ============================================

submitBtn.onclick =
async function(){

    const name =
    nameInput.value.trim();

    const phone =
    phoneInput.value.trim();

    if(!name || !phone){

        alert(
            '이름/전화번호 입력'
        );

        return;
    }

    const createdText =
    new Date()

    .toLocaleString('sv-SE')

    .replace(',', '');



    // =====================================
    // leads 저장
    // =====================================

    const {
        data,
        error
    } = await supabaseClient

    .from('leads')

    .insert([
        {
            created_text:
            createdText,

            name:name,

            phone:phone
        }
    ])

    .select()

    .single();



    if(error){

        console.error(error);

        alert(
            'DB 저장 실패'
        );

        return;
    }



    // =====================================
    // notes 저장
    // =====================================

    await supabaseClient

    .from('notes')

    .insert([
        {
            id:data.id,

            created_text:
            createdText,

            name:name,

            phone:phone
        }
    ]);



    alert(
        '무료 상담 신청 완료'
    );
};




// ============================================
// 실시간 새로고침
// ============================================

supabaseClient

.channel('realtime-leads')

.on(

    'postgres_changes',

    {
        event:'INSERT',

        schema:'public',

        table:'leads'
    },

    payload=>{

        console.log(
            payload
        );

        location.reload();
    }
)

.subscribe();




supabaseClient

.channel('realtime-notes')

.on(

    'postgres_changes',

    {
        event:'INSERT',

        schema:'public',

        table:'notes'
    },

    payload=>{

        console.log(
            payload
        );

        location.reload();
    }
)

.subscribe();
