// ============================================
// 파일 경로
// C:\malkum365-landing\script.js
// ============================================


// ============================================
// Supabase 실제 연결값 입력
// ============================================

// 반드시 본인 프로젝트 실제값으로 변경하세요

const SUPABASE_URL =
'https://YOUR_PROJECT.supabase.co';

const SUPABASE_ANON_KEY =
'YOUR_REAL_ANON_PUBLIC_KEY';


// ============================================
// Supabase Client 생성
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
// 상태값
// ============================================

let currentLeadId = null;

let autoSaveTimer = null;

let isCompleted = false;

let isCreating = false;


// ============================================
// 최초 INSERT
// ============================================

async function createLead(){

    if(isCreating){

        return;
    }

    isCreating = true;

    try{

        const name =
        nameInput.value.trim();

        const phone =
        phoneInput.value.trim();

        // 입력 없으면 저장 안함
        if(
            !name &&
            !phone
        ){

            isCreating = false;
            return;
        }

        const createdText =
        new Date()

        .toLocaleString('sv-SE')

        .replace(',', '');

        // ====================================
        // leads 저장
        // ====================================

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

            console.error(
                'INSERT 오류:',
                error
            );

            isCreating = false;

            return;
        }

        currentLeadId = data.id;

        console.log(
            '최초 저장 완료:',
            currentLeadId
        );

    }catch(err){

        console.error(err);
    }

    isCreating = false;
}


// ============================================
// UPDATE
// ============================================

async function updateLead(){

    if(currentLeadId === null){

        return;
    }

    try{

        const name =
        nameInput.value.trim();

        const phone =
        phoneInput.value.trim();

        const {
            error
        } = await supabaseClient

        .from('leads')

        .update({

            name:name,

            phone:phone

        })

        .eq(
            'id',
            currentLeadId
        );

        if(error){

            console.error(
                'UPDATE 오류:',
                error
            );

            return;
        }

        console.log(
            '실시간 업데이트 완료'
        );

    }catch(err){

        console.error(err);
    }
}


// ============================================
// 실시간 저장 시작
// ============================================

async function startRealtimeSave(){

    if(isCompleted){

        return;
    }

    // 최초 생성
    if(currentLeadId === null){

        await createLead();
    }

    // 중복 타이머 방지
    if(autoSaveTimer){

        return;
    }

    autoSaveTimer = setInterval(

        async()=>{

            if(isCompleted){

                clearInterval(
                    autoSaveTimer
                );

                return;
            }

            await updateLead();

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
// 버튼 클릭
// ============================================

submitBtn.addEventListener(

    'click',

    function(){

        isCompleted = true;

        clearInterval(
            autoSaveTimer
        );

        submitBtn.disabled = true;

        submitBtn.innerText =
        '신청 완료';

        submitBtn.style.opacity =
        '0.7';

        alert(
            '무료 상담 신청이 완료되었습니다.'
        );

        console.log(
            '상담 신청 완료'
        );
    }
);
