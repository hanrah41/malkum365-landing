/* =========================
   Supabase 설정
========================= */

const supabaseUrl =
'https://pziyabogqefxzvinwarg.supabase.co';

const supabaseKey =
'sb_publishable_VrVP0buVQ3kCBiQm88Jr5g_q61_DoK8';

const supabaseClient =
window.supabase.createClient(
    supabaseUrl,
    supabaseKey
);

/* =========================
   버튼 찾기
========================= */

const buttons =
document.querySelectorAll('.menu-btn');

const freeBtn =
buttons[1];

/* =========================
   무료신청
========================= */

freeBtn.onclick =
async function(){

    try{

        const name =
        prompt('고객명 입력');

        if(!name){

            return;
        }

        const phone =
        prompt('연락처 입력');

        if(!phone){

            return;
        }

        const memo =
        prompt('메모 입력');

        console.log(
            'insert 시작'
        );

        const result =
        await supabaseClient

        .from('leads')

        .insert([{

            name:name,

            phone:phone,

            memo:memo,

            status:'무료신청',

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
            '저장 완료'
        );

        loadLeads();

    }catch(err){

        console.error(err);

        alert(
            '실행 오류'
        );
    }
};

/* =========================
   데이터 불러오기
========================= */

async function loadLeads(){

    const result =
    await supabaseClient

    .from('leads')

    .select('*')

    .order(
        'id',
        {
            ascending:false
        }
    );

    console.log(result);

    if(result.error){

        console.error(
            result.error
        );

        return;
    }

    const body =
    document.getElementById(
        'crmBody'
    );

    body.innerHTML = '';

    result.data.forEach(item=>{

        const tr =
        document.createElement('tr');

        tr.innerHTML = `

            <td>${item.name || ''}</td>

            <td>${item.phone || ''}</td>

            <td>${item.created_text || ''}</td>

            <td>${item.status || ''}</td>

            <td>${item.memo || ''}</td>

        `;

        body.appendChild(tr);
    });
}

/* =========================
   시작
========================= */

loadLeads();
