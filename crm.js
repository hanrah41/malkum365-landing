/* =====================
   일반 입력
===================== */

const editableCells =
document.querySelectorAll(
    '.editable'
);

editableCells.forEach(cell=>{

    cell.onclick =
    async function(){

        const id =
        this.dataset.id;

        const field =
        this.dataset.field;

        const current =
        this.innerText.trim();

        /* =====================
           상태 / 메모
        ===================== */

        if(
            field === 'status' ||
            field === 'memo'
        ){

            const value =
            window.prompt(

`${field} 전체 입력

길게 작성 가능`,

                current

            );

            if(value === null)
            return;

            const result =
            await supabaseClient

            .from('crm_customers')

            .update({

                [field]:value

            })

            .eq(
                'id',
                id
            )

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

            loadAll();

            return;
        }

        /* =====================
           일반 셀
        ===================== */

        const value =
        prompt(

            `${field} 입력`,

            current

        );

        if(value === null)
        return;

        const result =
        await supabaseClient

        .from('crm_customers')

        .update({

            [field]:value

        })

        .eq(
            'id',
            id
        )

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

        loadAll();
    };
});
