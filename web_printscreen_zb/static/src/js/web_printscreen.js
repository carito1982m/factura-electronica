openerp.web_printscreen_zb = function(instance, m) {
    
    var _t = instance.web._t,
    QWeb = instance.web.qweb;
    
    instance.web.ListView.include({
        load_list: function () {
            var self = this;
            this._super.apply(this, arguments);
            var links = document.getElementsByClassName("oe_list_button_import_excel");
            var links_pdf = document.getElementsByClassName("oe_list_button_import_pdf");
            if (links && links[0]){
                links[0].onclick = function() {
                    self.export_to_excel("excel")
                };
            }
            if (links_pdf && links_pdf[0]){
                links_pdf[0].onclick = function() {
                    self.export_to_excel("pdf")
                };
            }
        },
        export_to_excel: function(export_type) {
            var self = this
            var export_type = export_type
            view = this.getParent()
            // Find Header Element
            header_eles = self.$el.find('.oe_list_header_columns')
            header_name_list = []
            $.each(header_eles,function(){
                $header_ele = $(this)
                header_td_elements = $header_ele.find('th')
                $.each(header_td_elements,function(){
                    $header_td = $(this)
                    //if ($header_td.attr('data-id')){
                    text = $header_td && $header_td[0] && $header_td[0].innerText || ""
                    data_id = $header_td.attr('data-id')
                    if (text && !data_id){
                        data_id = 'group_name'
                    }
                    header_name_list.push({'header_name': text.trim(), 'header_data_id': data_id})
                   // }
                });
            });
            
            //Find Data Element
            data_eles = self.$el.find('.oe_list_content > tbody > tr')
            export_data = []
            $.each(data_eles,function(){
                data = []
                $data_ele = $(this)
                
                //Find group name
                group_th_eles = $data_ele.find('th')
                $.each(group_th_eles,function(){
                    $group_th_ele = $(this)
                    text = $group_th_ele && $group_th_ele[0] && $group_th_ele[0].innerText || ""
                    data.push({'data': text, 'bold': true})
                });
                data_td_eles = $data_ele.find('td')
                $.each(data_td_eles,function(){
                    $data_td_ele = $(this)
                    text = $data_td_ele && $data_td_ele[0] && $data_td_ele[0].innerText || ""
                    if ($data_td_ele && $data_td_ele[0].classList.contains('oe_number')){
                        data.push({'data': text, 'number': true})
                    }
                    else{
                        data.push({'data': text})
                    }
                });
                export_data.push(data)
            });
            
            //Find Footer Element
            
            footer_eles = self.$el.find('.oe_list_content > tfoot> tr')
            $.each(footer_eles,function(){
                data = []
                $footer_ele = $(this)
                footer_td_eles = $footer_ele.find('td')
                $.each(footer_td_eles,function(){
                    $footer_td_ele = $(this)
                    text = $footer_td_ele && $footer_td_ele[0] && $footer_td_ele[0].innerText || ""
                    if ($footer_td_ele && $footer_td_ele[0].classList.contains('oe_number')){
                        data.push({'data': text, 'bold': true, 'number': true})
                    }
                    else{
                        data.push({'data': text, 'bold': true})
                    }
                });
                export_data.push(data)
            });
            
            //Export to excel
            $.blockUI();
            if (export_type === 'excel'){
                 view.session.get_file({
                     url: '/web/export/zb_excel_export',
                     data: {data: JSON.stringify({
                            model : view.model,
                            headers : header_name_list,
                            rows : export_data,
                     })},
                     complete: $.unblockUI
                 });
             }
             else{
                console.log(view)
                new instance.web.Model("res.users").get_func("read")(this.session.uid, ["company_id"]).then(function(res) {
                    new instance.web.Model("res.company").get_func("read")(res['company_id'][0], ["name"]).then(function(result) {
                        view.session.get_file({
                             url: '/web/export/zb_pdf_export',
                             data: {data: JSON.stringify({
                                    uid: view.session.uid,
                                    model : view.model,
                                    headers : header_name_list,
                                    rows : export_data,
                                    company_name: result['name']
                             })},
                             complete: $.unblockUI
                         });
                    });
                });
             }
        },
    });
};