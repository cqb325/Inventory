/**
 * Created by cqb32_000 on 2016-07-19.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const Component = React.Component;
const Label = require('../lib/Label');
const Button = require('../lib/Button');
const Tile = require('../Tile');
const Table = require('../lib/Table');

let List = React.createClass({
    displayName: 'List',


    render() {
        let header = [{ name: "name", text: "名称" }];
        return React.createElement(
            'div',
            { className: 'main-container' },
            React.createElement(
                Label,
                { className: 'searchTools mt-30 mb-20', component: 'div' },
                React.createElement(
                    Button,
                    { icon: 'plus', theme: 'success' },
                    '新增供应商'
                )
            ),
            React.createElement(
                Tile,
                { header: '供应商列表' },
                React.createElement(Table, { header: header, data: [] })
            )
        );
    }
});

module.exports = List;
