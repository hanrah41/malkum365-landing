// ============================================
// C:\malkum365-landing\script.js
// ============================================


// ============================================
// Supabase
// ============================================

const SUPABASE_URL =
'https://YOUR_PROJECT.supabase.co';

const SUPABASE_ANON_KEY =
'YOUR_ANON_KEY';

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


// ============================================
// 상태
// ============================================

let autoSaveTimer = null;

let currentLeadId = null;

let isCompleted = false;

let isSaving = false;


// ============================================
// 최초 저장
// ============================================

async function createLead(){

    if(isSaving){

        return;
    }

    isSaving = true;

    try{

        const name =
        nameInput.value.trim();

        const phone =
        phoneInput.value.trim();

        if(!name && !phone){

            isSaving = false;
            return;
        }

        const {
            data,
            error
        } = await supabaseClient

        .from('leads')

        .insert([
            {
                name:name,
                phone:phone
            }
        ])

        .select()

        .single();

        if(error){

            console.error(error);

            isSaving = false;
            return;
        }

        currentLeadId = data.id;

        console.log(
            '최초 생성:',
            currentLeadId
        );

    }catch(err){

        console.error(err);
    }

    isSaving = false;
}


// ============================================
// UPDATE
// ============================================

async function updateLead(){

    if(
        currentLeadId === null
    ){
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

            console.error(error);
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

    // 최초 1회 생성
    if(currentLeadId === null){

        await createLead();
    }

    // 이미 타이머 실행중이면 종료
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
// 상담 신청 완료
// ============================================

function submitConsultation(){

    isCompleted = true;

    clearInterval(
        autoSaveTimer
    );

    alert(
        '무료 상담 신청 완료'
    );

    console.log(
        '실시간 저장 종료'
    );
}
