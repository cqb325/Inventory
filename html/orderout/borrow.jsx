const React = require('react');
const ReactDOM = require('react-dom');
const Component = React.Component;
const Label = require('../lib/Label');
const Button = require('../lib/Button');
const Tile = require('../Tile');
const Table = require('../lib/Table');
const Input = require('../lib/Input');
const Select = require('../lib/Select');
const DateTime = require('../lib/DateTime');
const moment = require('../lib/moment');
const Form = require('../lib/Form');
const FormControl = require('../lib/FormControl');
const MessageBox = require('../lib/MessageBox');
const AutoComplete = require('../lib/AutoComplete');
const Format = require('../format');
const TextArea = require('../lib/TextArea');

const ExportService = require("../services/ExportService");
const StaffService = require("../services/StaffService");
const ProductService = require("../services/ProductService");

let Page = React.createClass({

    getInitialState(){
        this.products = {};
        this.counts = {};
        return {};
    },

    payFund(){
        let ord_no = this.refs.tip.getData();
        if(ord_no){
            window.location.href = "#export_payFund/"+ord_no;
        }
    },

    componentDidMount(){
        this.loadAllStaffs();
        this.loadAllProducts();
    },

    loadAllStaffs(){
        StaffService.getAll((staffs)=>{
            this.refs.staff.item.setData(staffs);
        });
    },

    loadAllProducts(){
        ProductService.getAllStoredProducts((products)=>{
            if(products){
                products.forEach((product)=>{
                    this.products[product.prod_id] = product;
                });
            }
            window.setTimeout(()=>{
                this.refs.table.setData(products);
            },0);
        });
    },

    add2Warehouse(row){
        let import_table_Data = this.refs.import_table.state.data;
        import_table_Data.push(row);
        this.refs.import_table.setData(import_table_Data);

        let table_Data = this.refs.table.state.data;
        let filter_data = table_Data.filter(function(item){
            if(item == row){
                return false;
            }
            return true;
        });

        this.refs.table.setData(filter_data);
    },

    removeFromWarehouse(row){
        let import_table_Data = this.refs.import_table.state.data;
        let filter_data = import_table_Data.filter(function(item){
            if(item == row){
                return false;
            }
            return true;
        });
        this.refs.import_table.setData(filter_data);

        let table_Data = this.refs.table.state.data;
        table_Data.push(row);
        this.refs.table.setData(table_Data);

        delete this.counts[row.prod_id];

        window.setTimeout(()=>{
            this.updateTotalFund();
        },10);
    },

    saveForm(){
        let formItems = this.refs.form.getItems();
        let params = {
            prov_id: formItems["staff_id"].ref.getValue(),
            ord_comment: formItems["ord_comment"].ref.getValue(),
            ord_fund: 0,
            sign_user: formItems["sign_user"].ref.getValue(),
            ord_time: formItems["ord_time"].ref.getValue()
        };

        let import_table_Data = this.refs.import_table.state.data;

        let prod_params = [];
        import_table_Data.forEach((item)=>{
            let prod_amount = this.counts[item.prod_id].getValue();
            prod_params.push({
                prod_id: item.prod_id,
                prod_amount: prod_amount,
                prod_fund: 0,
                prod_price: 0
            });
        });

        ExportService.borrow(params, prod_params, (ret)=>{
            if(ret){
                this.refs.tip.show("提交成功");
                this.refs.tip.setData(ret);
            }else{
                this.refs.tip.show("提交失败");
                this.refs.tip.setData(false);
            }
        });
    },

    render(){
        let scope = this;
        let btnFormat = function(value, column, row){
            return <Button theme="success" flat={true} onClick={scope.add2Warehouse.bind(scope, row)}>出库</Button>
        };

        let btnFormat2 = function(value, column, row){
            return <Button theme="success" flat={true} onClick={scope.removeFromWarehouse.bind(scope, row)}>删除</Button>
        };

        let countFormat = function(value, column, row){
            return <span><FormControl style={{width: "80px"}} ref={(ref)=>{scope.counts[row.prod_id] = ref}} name="count" type="number"
                                      rules={{required: true, max: row.amount}}
                                      onValid={(value, valid)=>{if(!valid){
                                            scope.counts[row.prod_id].setValue("");
                                        }
                                      } }
                />{Format.unitDataMap[row.prod_unit]}</span>
        };

        let header = [
            {name: "prod_name", text: "名称", tip: true},
            {name: "prod_price", text: "单价"},
            {name: "prod_model", text: "型号"},
            {name: "amount", text: "剩余量"},
            {name: "op", text: "操作", format: btnFormat}
        ];
        let header2 = [
            {name: "prod_name", text: "名称", tip: true},
            {name: "amount", text: "剩余量"},
            {name: "prod_num", text: "数量", format: countFormat},
            {name: "op", text: "操作", format: btnFormat2}
        ];
        return (
            <div className="main-container">
                <MessageBox title="提示" ref="tip" confirm={this.payFund}/>
                <Label className="searchTools mt-30 mb-20" component="div">
                    <Label grid={0.3}>
                        <h4>内部借用</h4>
                    </Label>
                </Label>

                <Tile header="借用信息" >
                    <Form ref="form" method="custom" layout="stack" useDefaultSubmitBtn={false}>
                        <FormControl label={<span><img src={IMGPATH+"icon-gys.png"}/> 借用员工: </span>} ref="staff" type="autocomplete" data={[]} name="staff_id" grid={1} required></FormControl>
                        <FormControl label={<span><img src={IMGPATH+"icon-clock.png"}/> 借用日期: </span>} type="datetime" dateOnly={true} value={moment().format("YYYY-MM-DD")} endDate={moment()} name="ord_time" grid={1} required></FormControl>
                        <FormControl label={<span><img src={IMGPATH+"icon-user.png"}/> 签署人: </span>} type="text" name="sign_user" grid={1} required></FormControl>
                        <FormControl label={<span><img src={IMGPATH+"icon-comment.png"}/> 备注: </span>} type="textarea" name="ord_comment" grid={1}></FormControl>
                    </Form>
                </Tile>

                <Label grid={0.45} style={{"verticalAlign": "top"}}>
                    <Tile header="库存产品" >
                        <Table ref="table" header={header} data={[]} striped={true} className="text-center"/>
                    </Tile>
                </Label>
                <Label grid={{width: 0.54, offset: 0.01}}>
                    <Tile header="出库产品" >
                        <Table ref="import_table" header={header2} data={[]} striped={true} className="text-center"/>
                    </Tile>
                </Label>

                <Label className="mt-20 text-center mb-30">
                    <Button theme="success" raised={true} onClick={this.saveForm}>借 出</Button>
                </Label>
            </div>
        );
    }
});

module.exports = Page;