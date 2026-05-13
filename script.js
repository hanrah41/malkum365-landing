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

const requiredChecks =
document.querySelectorAll('.check-area input[type="checkbox"]');



// ============================================
// 신청 폼 초기화
// - 이름 초기화
// - 전화번호 초기화
// - 체크박스 초기화
// ============================================

function resetConsultForm(){

    if(nameInput){

        nameInput.value =
        '';
    }

    if(phoneInput){

        phoneInput.value =
        '';
    }

    requiredChecks.forEach(function(check){

        check.checked =
        false;
    });
}



// ============================================
// 페이지 진입 시 초기화
// - 브라우저 자동완성 값이 남는 문제 방지
// ============================================

window.addEventListener(
    'DOMContentLoaded',
    function(){

        resetConsultForm();

        setTimeout(function(){

            resetConsultForm();

        }, 100);

        setTimeout(function(){

            resetConsultForm();

        }, 500);
    }
);



// ============================================
// 버튼
// ============================================

submitBtn.onclick =
async function(){

    const name =
    nameInput.value.trim();

    const phone =
    phoneInput.value.trim();



    // =====================================
    // 이름 / 전화번호 검증
    // =====================================

    if(!name || !phone){

        alert(
            '이름/전화번호 입력'
        );

        return;
    }



    // =====================================
    // 필수 체크박스 검증
    // =====================================

    let allRequiredChecked =
    true;

    requiredChecks.forEach(function(check){

        if(!check.checked){

            allRequiredChecked =
            false;
        }
    });

    if(!allRequiredChecked){

        alert(
            '필수 항목을 체크하세요.'
        );

        return;
    }



    const createdText =
    new Date()

    .toLocaleString('sv-SE')

    .replace(',', '');



    // =====================================
    // leads 저장
    // 보안 수정:
    // - .select().single() 제거
    // - RLS 적용 시 INSERT만 허용 가능하도록 변경
    // =====================================

    const leadsResult =
    await supabaseClient

    .from('leads')

    .insert([
        {
            created_text:
            createdText,

            name:
            name,

            phone:
            phone
        }
    ]);



    if(leadsResult.error){

        console.error(
            leadsResult.error
        );

        alert(
            'DB 저장 실패'
        );

        return;
    }



    // =====================================
    // notes 저장
    // 보안 수정:
    // - id:data.id 제거
    // - notes.id는 Supabase에서 자동 생성되도록 사용
    // =====================================

    const notesResult =
    await supabaseClient

    .from('notes')

    .insert([
        {
            created_text:
            createdText,

            name:
            name,

            phone:
            phone
        }
    ]);



    if(notesResult.error){

        console.error(
            notesResult.error
        );

        alert(
            '상담 메모 저장 실패'
        );

        return;
    }



    alert(
        '무료 상담 신청 완료'
    );



    // =====================================
    // 신청 완료 후 즉시 초기화
    // =====================================

    resetConsultForm();
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
