// ============================================
// C:\malkum365-landing\script.js
// ============================================


// ============================================
// Supabase 설정
// ============================================

const SUPABASE_URL =
'https://YOUR_PROJECT.supabase.co';

const SUPABASE_ANON_KEY =
'YOUR_ANON_KEY';

const supabaseClient =
supabase.createClient(
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
// 상태 변수
// ============================================

let autoSaveTimer = null;

let currentLeadId = null;

let completed = false;


// ============================================
// 실시간 저장 시작
// ============================================

function startRealtimeSave(){

    if(completed){

        return;
    }

    // 이미 실행중이면 중복 생성 금지
    if(autoSaveTimer){

        return;
    }

    autoSaveTimer = setInterval(

        async()=>{

            if(completed){

                clearInterval(
                    autoSaveTimer
                );

                return;
            }

            const name =
            nameInput.value.trim();

            const phone =
            phoneInput.value.trim();

            // 둘다 비어있으면 저장 안함
            if(
                !name &&
                !phone
            ){
                return;
            }

            try{

                // ============================
                // 최초 저장
                // ============================

                if(currentLeadId === null){

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
                        return;
                    }

                    currentLeadId = data.id;

                    console.log(
                        '최초 저장 완료'
                    );
                }

                // ============================
                // 이후 수정
                // ============================

                else{

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
                }

            }catch(err){

                console.error(err);
            }

        },

        1000
    );
}


// ============================================
// 입력 시작 감지
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
// 신청 완료
// ============================================

function submitConsultation(){

    completed = true;

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
