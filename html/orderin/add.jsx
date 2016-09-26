const React = require('react');
const ReactDOM = require('react-dom');
const Component = React.Component;
const Label = require('../lib/Label');
const Button = require('../lib/Button');
const Tile = require('../Tile');
const Table = require('../lib/Table');
const Input = require('../lib/Input');
const Select = require('../lib/Select');
const Form = require('../lib/Form');
const DateTime = require('../lib/DateTime');
const FormControl = require('../lib/FormControl');
const MessageBox = require('../lib/MessageBox');
const AutoComplete = require('../lib/AutoComplete');
const Format = require('../format');
const TextArea = require('../lib/TextArea');
const moment = require('../lib/moment');

const ImportService = require("../services/ImportService");
const ProviderService = require("../services/ProviderService");
const ProductService = require("../services/ProductService");

let Page = React.createClass({

    getInitialState(){
        this.products = {};
        this.funds = {};
        this.counts = {};
        this.prices = {};
        return {
        };
    },

    payFund(){
        let ord_no = this.refs.tip.getData();
        if(ord_no){
            window.location.href = "#import_payFund/"+ord_no;
        }
    },

    componentDidMount(){
        this.loadAllProviders();
        this.reloadProducts();
    },

    loadAllProviders(){
        ProviderService.getAll((providers)=>{
            this.refs.provider.item.setData(providers);
        });
    },

    reloadProducts(){
        ProductService.getAll((products)=>{
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

        delete this.funds[row.prod_id];
        delete this.prices[row.prod_id];
        delete this.counts[row.prod_id];

        window.setTimeout(()=>{
            this.updateTotalFund();
        },10);
    },

    updateFund(count, row){
        let fundEle = this.funds[row.prod_id];
        let price = this.prices[row.prod_id].getValue() || 0;
        count = this.counts[row.prod_id].getValue() || 0;
        let fund = count * price;
        fundEle.setValue(fund);

        window.setTimeout(()=>{
            this.updateTotalFund();
        },0);
    },

    /**
     * 更新总价
     */
    updateTotalFund(){
        let total = 0;
        for(let i in this.funds){
            let fundEle = this.funds[i];
            if(fundEle) {
                let val = fundEle.getValue();
                if (val) {
                    total += parseFloat(val);
                }
            }
        }

        let totalEle = ReactDOM.findDOMNode(this.refs.total);
        totalEle.innerHTML = total;
    },

    saveForm(){
        let totalEle = ReactDOM.findDOMNode(this.refs.total);
        let total = totalEle.innerHTML;

        let formItems = this.refs.form.getItems();
        if(!this.refs.form.isValid()){
            return false;
        }
        let params = {
            ord_contract: formItems["ord_contract"].ref.getValue(),
            prov_id: formItems["prov_id"].ref.getValue(),
            ord_comment: formItems["ord_comment"].ref.getValue(),
            ord_fund: total,
            sale_contract: formItems["sale_contract"].ref.getValue(),
            ord_time: formItems["ord_time"].ref.getValue(),
            order_type: formItems["order_type"].ref.getValue()
        };

        let import_table_Data = this.refs.import_table.state.data;

        let prod_params = [];
        import_table_Data.forEach((item)=>{
            let prod_amount = this.counts[item.prod_id].getValue();
            let prod_price = this.prices[item.prod_id].getValue();
            let prod_fund = this.funds[item.prod_id].getValue();
            prod_params.push({
                prod_id: item.prod_id,
                prod_amount: prod_amount,
                prod_fund: prod_fund,
                prod_price: prod_price
            });
        });

        ImportService.addOrder(params, prod_params, (ret)=>{
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
            return <Button theme="success" flat={true} onClick={scope.add2Warehouse.bind(scope, row)}>入库</Button>
        };

        let btnFormat2 = function(value, column, row){
            return <Button theme="success" flat={true} onClick={scope.removeFromWarehouse.bind(scope, row)}>删除</Button>
        };

        let countFormat = function(value, column, row){
            return <span><FormControl style={{width: "80px"}} ref={(ref)=>{scope.counts[row.prod_id] = ref}} name="count" type="number" onChange={(avalue)=>{scope.updateFund(avalue, row)}} rules={{required: true}} grid={0.6}/>{Format.unitDataMap[row.prod_unit]}</span>
        };

        let fundFormat = function(value, column, row){
            return <span><FormControl style={{width: "80px"}} ref={(ref)=>{scope.funds[row.prod_id] = ref}} name="fund" type="number" grid={0.7}/>元</span>
        };

        let priceFormat = function(value, column, row){
            return <span><FormControl style={{width: "80px"}} ref={(ref)=>{scope.prices[row.prod_id] = ref}} name="price" onChange={(avalue)=>{scope.updateFund(avalue, row)}} rules={{required: true}} type="number" grid={0.7}/>元</span>
        };

        let header = [
            {name: "prod_name", text: "名称", tip: true},
            {name: "prod_price", text: "单价"},
            {name: "prod_model", text: "型号"},
            {name: "op", text: "操作", format: btnFormat}
        ];
        let header2 = [
            {name: "prod_name", text: "名称", tip: true},
            {name: "prod_price", text: "单价", format: priceFormat},
            {name: "prod_model", text: "型号"},
            {name: "prod_num", text: "数量", format: countFormat},
            {name: "prod_fund", text: "总价", format: fundFormat},
            {name: "op", text: "操作", format: btnFormat2}
        ];

        let orderTypes = [];
        for(let i in Format.ORDER_TYPE_IN_MAP){
            orderTypes.push({
                id: i,
                text: Format.ORDER_TYPE_IN_MAP[i]
            });
        }
        return (
            <div className="main-container">
                <MessageBox title="提示" ref="tip" confirm={this.payFund}/>
                <Label className="searchTools mt-30 mb-20" component="div">
                    <Label grid={0.3}>
                        <h4>入库</h4>
                    </Label>
                    <Label grid={0.7} className="text-right">
                        <Button icon="mail-reply" theme="info" raised={true} href="javascript:history.go(-1)">返 回</Button>
                    </Label>
                </Label>

                <Tile header="入库信息" >
                    <ul className="nav nav-pills nav-justified step step-progress">
                        <li><a><span>已签合同</span><span className="caret"></span></a>
                        </li>
                        <li><a><span>预付款</span><span className="caret"></span></a>
                        </li>
                        <li><a><span>已付款</span><span className="caret"></span></a>
                        </li>
                        <li><a><span>已发货</span><span className="caret"></span></a>
                        </li>
                        <li><a><span>已入库</span><span className="caret"></span></a>
                        </li>
                    </ul>

                    <Form ref="form" method="custom" layout="stack" useDefaultSubmitBtn={false} className="mt-20">
                        <FormControl label={<span><img src={IMGPATH+"icon-gys.png"}/> 类型: </span>} ref="order_type" type="select" data={orderTypes} name="order_type" grid={1} required></FormControl>
                        <FormControl label={<span><img src={IMGPATH+"contract.png"}/> 采购合同号: </span>} type="text" name="ord_contract" grid={1} required></FormControl>
                        <FormControl label={<span><img src={IMGPATH+"icon-clock.png"}/> 采购签约日期: </span>} type="datetime" dateOnly={true} value={moment().format("YYYY-MM-DD")} endDate={moment()} name="ord_time" grid={1} required></FormControl>
                        <FormControl label={<span><img src={IMGPATH+"contract.png"}/> 销售合同号: </span>} type="text" name="sale_contract" grid={1} required></FormControl>
                        <FormControl label={<span><img src={IMGPATH+"icon-gys.png"}/> 供应商: </span>} ref="provider" type="autocomplete" data={[]} name="prov_id" grid={1} required></FormControl>

                        <FormControl label={<span><img src={IMGPATH+"icon-comment.png"}/> 备注: </span>} type="textarea" name="ord_comment" grid={1}></FormControl>
                    </Form>
                </Tile>

                <Label grid={0.45} style={{"verticalAlign": "top"}}>
                    <Tile header="选择产品" contentStyle={{"maxHeight": "500px", "overflow": "auto"}}>
                        <Table ref="table" header={header} data={[]} striped={true} className="text-center"/>
                    </Tile>
                </Label>
                <Label grid={{width: 0.54, offset: 0.01}}>
                    <Tile header="入库产品" contentStyle={{"maxHeight": "500px", "overflow": "auto"}}>
                        <Table ref="import_table" header={header2} data={[]} striped={true} className="text-center"/>
                    </Tile>
                    <span>总价: <span ref="total"></span>元</span>
                </Label>

                <Label className="mt-20 text-center mb-30">
                    <Button theme="success" raised={true} onClick={this.saveForm}>去付款</Button>
                </Label>
            </div>
        );
    }
});

module.exports = Page;