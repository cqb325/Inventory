const React = require('react');
const ReactDOM = require('react-dom');
const Component = React.Component;

const Tile = require('../Tile');
const Input = require('../lib/Input');
const Form = require('../lib/Form');
const FormControl = require('../lib/FormControl');
const Label = require('../lib/Label');
const Button = require('../lib/Button');
const Select = require('../lib/Select');
const MessageBox = require('../lib/MessageBox');
const Format = require('../format');

const StaffService = require("../services/StaffService");

let Page = React.createClass({

    getInitialState(){
        return {
            staff: null
        };
    },

    submit(){
        let formItems = this.refs.form.getItems();
        let params = {
            staff_id: this.props.params.staff_id,
            staff_name: formItems["staff_name"].ref.getValue(),
            staff_phone: formItems["staff_phone"].ref.getValue()
        };

        StaffService.saveEdit(params, (ret)=>{
            if(ret){
                this.refs.tip.show("保存成功");
                this.refs.tip.setData(true);
            }else{
                this.refs.tip.show("保存失败");
                this.refs.tip.setData(false);
            }
        });
    },

    confirm(){
        if(this.refs.tip.getData()){
            window.location.href = "#StaffList";
        }
    },

    componentDidMount(){
        StaffService.getStaff(this.props.params.staff_id, (staff)=>{
            this.setState({staff});
        });
    },

    render(){
        let staff = this.state.staff;
        let unitData = Format.unitData;
        return (
            <div className="main-container">
                <MessageBox title="提示" ref="tip" confirm={this.confirm}/>
                <Label className="searchTools mt-30 mb-20" component="div">
                    <Label grid={0.3}>
                        <h4>编辑员工信息</h4>
                    </Label>
                    <Label grid={0.7} className="text-right">
                        <Button icon="mail-reply" theme="info" raised={true} href="javascript:history.go(-1)">返 回</Button>
                    </Label>
                </Label>

                <Tile header="员工信息">
                    <Form ref="form" method="custom" layout="stack" submit={this.submit}>
                        <FormControl label="员工名称: " value={staff ? staff.staff_name : ""} type="text" name="staff_name" maxLength="125" grid={1} required></FormControl>
                        <FormControl label="员工手机: " value={staff ? staff.staff_phone : ""} type="number" name="staff_phone" maxLength="11" grid={1} required></FormControl>
                    </Form>
                </Tile>

            </div>
        );
    }
});

module.exports = Page;