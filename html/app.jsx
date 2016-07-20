const React = require('react');
const ReactDOM = require('react-dom');
const Component = React.Component;

const SupplierList = require('./supplier/list');

const ReactRouter = require('react-router');
const Router = ReactRouter.Router;
const hashHistory = ReactRouter.hashHistory;
const Route = ReactRouter.Route;
const IndexRoute = ReactRouter.IndexRoute;
const Link = ReactRouter.Link;
const IndexLink = ReactRouter.Link;

const APP = {
    sysName: "CLY",
    menus: [
        {id:"1", text: "供应商管理",icon: "fa fa-calendar",link: "SupplierList", component: SupplierList}
    ]
};


const SideBar = require("./lib/SideBar");

const App = React.createClass({
    render() {
        return (
            <div>
                <SideBar data={APP.menus} style={{width: '200px'} } logo="../assets/imgs/logo.png" header={APP.sysName}>
                    {this.props.children}
                </SideBar>
            </div>
        )
    }
});

let routers = [];
APP.menus.map(function(item, index){
    if(item.children){
        item.children.forEach(function(subItem, subIndex){
            routers.push(
                <Route key={subIndex} path={subItem.link} component={subItem.component} />
            );
        });
    }
    routers.push(<Route key={index} path={item.link} component={item.component} />);
});

let Dashboard = React.createClass({
    render() {
        return <div>Welcome to the app!</div>
    }
});

ReactDOM.render((
    <Router history={hashHistory}>
        <Route path="/" component={App}>
            <IndexRoute component={Dashboard} />
            {routers}
        </Route>
    </Router>
), document.querySelector("#desktop"));