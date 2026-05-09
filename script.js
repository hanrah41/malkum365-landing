// ============================================
// 파일 경로
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
// 입력 요소
// ============================================

const nameInput =
document.getElementById('name');

const phoneInput =
document.getElementById('phone');


// ============================================
// 실시간 저장 변수
// ============================================

let autoSaveTimer = null;

let currentLeadId = null;

let completed = false;


// ============================================
// 실시간 저장 시작
// ============================================

function startRealtimeSave(){

    if(autoSaveTimer){

        clearInterval(autoSaveTimer);
    }

    autoSaveTimer = setInterval(async()=>{

        if(completed) return;

        const name =
        nameInput.value.trim();

        const phone =
        phoneInput.value.trim();

        // 아무것도 없으면 저장 안함
        if(!name && !phone){

            return;
        }

        try{

            // ====================================
            // 최초 INSERT
            // ====================================

            if(currentLeadId === null){

                const { data, error } =
                await supabaseClient

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
                    '최초 저장 완료:',
                    currentLeadId
                );
            }

            // ====================================
            // 이후 UPDATE
            // ====================================

            else{

                const { error } =
                await supabaseClient

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

    },1000);
}


// ============================================
// 입력 감지 시 자동 저장 시작
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
// 최종 신청 버튼
// ============================================

async function submitConsultation(){

    completed = true;

    clearInterval(autoSaveTimer);

    alert(
        '무료 상담 신청이 완료되었습니다.'
    );

    console.log(
        '실시간 저장 종료'
    );
}
