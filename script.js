// ============================================
// Supabase
// ============================================

const supabaseClient =
window.supabase.createClient(

    window.SUPABASE_URL_GLOBAL,

    window.SUPABASE_ANON_KEY_GLOBAL
);


// ============================================
// 버튼
// ============================================

const submitBtn =
document.getElementById('submitBtn');


// ============================================
// 클릭
// ============================================

submitBtn.onclick =
async function(){

    const name =
    document
    .getElementById('name')
    .value
    .trim();

    const phone =
    document
    .getElementById('phone')
    .value
    .trim();

    if(!name || !phone){

        alert(
            '이름과 전화번호 입력'
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
        '무료 상담 신청이 완료되었습니다.'
    );
};
