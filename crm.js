// ============================================
// C:\malkum365-landing\script.js
// ============================================


// ============================================
// 전역값 가져오기
// ============================================

const SUPABASE_URL =
window.SUPABASE_URL_GLOBAL;

const SUPABASE_ANON_KEY =
window.SUPABASE_ANON_KEY_GLOBAL;


// ============================================
// Supabase 생성
// ============================================

const supabaseClient =
window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// ============================================
// 요소
// ============================================

const nameInput =
document.getElementById('name');

const phoneInput =
document.getElementById('phone');

const submitBtn =
document.getElementById('submitBtn');


// ============================================
// 상태
// ============================================

let currentLeadId = null;

let autoSaveTimer = null;

let isCompleted = false;


// ============================================
// INSERT
// ============================================

async function createLead(){

    try{

        const name =
        nameInput.value.trim();

        const phone =
        phoneInput.value.trim();

        if(!name || !phone){

            return;
        }

        const createdText =
        new Date()

        .toLocaleString('sv-SE')

        .replace(',', '');

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

        currentLeadId = data.id;

        console.log(
            '저장 완료'
        );

    }catch(err){

        console.error(err);

        alert(err.message);
    }
}


// ============================================
// 실시간 저장
// ============================================

function startRealtimeSave(){

    if(isCompleted){

        return;
    }

    if(autoSaveTimer){

        clearTimeout(
            autoSaveTimer
        );
    }

    autoSaveTimer =
    setTimeout(

        async()=>{

            await createLead();

        },

        1000
    );
}


// ============================================
// 입력 감지
// ============================================

nameInput.addEventListener(
    'input',
    startRealtimeSave
);

phoneInput.addEventListener(
    'input',
    startRealtimeSave
);


// ============================================
// 버튼
// ============================================

submitBtn.addEventListener(

    'click',

    function(){

        isCompleted = true;

        alert(
            '무료 상담 신청이 완료되었습니다.'
        );
    }
);
