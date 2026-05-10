/* =========================
   신규등록
========================= */

newBtn.onclick =
async function(){

    activeButton(
        newBtn
    );

    try{

        const name =
        prompt('성명 입력');

        if(!name) return;

        const result =
        await supabaseClient

        .from('leads')

        .insert([{

            name:name,

            phone:'',

            memo:'',

            status:'상담예정',

            created_text:
            new Date()

            .toLocaleString()

        }])

        .select();

        console.log(result);

        if(result.error){

            console.error(
                result.error
            );

            alert(
                'DB 저장 실패'
            );

            return;
        }

        alert(
            '신규등록 완료'
        );

        loadAll();

    }catch(err){

        console.error(err);

        alert(
            '오류 발생'
        );
    }
};
