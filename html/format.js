/**
 * Created by cqb32_000 on 2016-08-05.
 */
module.exports = {
    unitData: [
        {id: "0", text: "个"},
        {id: "113", text: "台"},
        {id: "114", text: "箱"},
        {id: "10", text: "毫米"},
        {id: "11", text: "厘米"},
        {id: "12", text: "米"},
        {id: "13", text: "千米"},
        {id: "20", text: "升"},
        {id: "30", text: "克"},
        {id: "31", text: "千克"},
        {id: "32", text: "吨"},
        {id: "101", text: "瓶"},
        {id: "102", text: "双"},
        {id: "103", text: "套"},
        {id: "104", text: "只"},
        {id: "105", text: "付"},
        {id: "106", text: "尊"},
        {id: "107", text: "件"},
        {id: "108", text: "把"},
        {id: "109", text: "罐"},
        {id: "110", text: "包"},
        {id: "111", text: "盒"},
        {id: "112", text: "辆"},
        {id: "115", text: "根"}
    ],

    unitDataMap: {
        "0": "个",
        "113": "台",
        "114": "箱",
        "10": "毫米",
        "11": "厘米",
        "12": "米",
        "13": "千米",
        "20": "升",
        "30": "克",
        "31": "千克",
        "32": "吨",
        "101": "瓶",
        "102": "双",
        "103": "套",
        "104": "只",
        "105": "付",
        "106": "尊",
        "107": "件",
        "108": "把",
        "109": "罐",
        "110": "包",
        "111": "盒",
        "112": "辆",
        "115": "根"
    },

    ORDER_STATUS: {
        SIGNED: 0,
        FUND: 1,
        FUND_SEND: 2,
        FUNDED: 3,
        SEND: 4,
        IMPORTED: 10
    },

    ORDER_TYPE: {
        IN: 1,
        OUT: 2,
        INNER_BACK: 3,
        INNER_BORROW: 4,
        CLIENT_BACK: 5,
        CLIENT_BORROW: 6
    },

    ORDER_TYPE_IN_MAP: {
        "1": "采购",
        "5": "客户归还"
    },

    ORDER_TYPE_OUT_MAP: {
        "2": "销售",
        "4": "内部借用",
        "6": "客户借用"
    }
};