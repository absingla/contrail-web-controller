/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var QEGridConfig = function () {
        this.getColumnDisplay4Grid = function(queryPrefix, selectArray) {
            var newColumnDisplay = [],
                columnDisplay = getColumnDisplay4Query(queryPrefix);

            $.each(columnDisplay, function(key, val){
                if (selectArray.indexOf(val.select) != -1) {
                    newColumnDisplay.push(val.display);
                }
            });

            return newColumnDisplay;
        };
    };

    function getColumnDisplay4Query(queryPrefix) {
        switch(queryPrefix) {
            case qewc.FS_QUERY_PREFIX:
                return fsColumnDisplay;
        }
    };

    var fsColumnDisplay = [
        {select:"T", display:{id:"T", field:"T", width:180, minWidth:180, name:"Time", formatter: function(r, c, v, cd, dc){ return formatMicroDate(dc.T);}, filterable:false, groupable:false}},
        {select:"vrouter", display:{id:"vrouter",field:"vrouter", width:150, name:"Virtual Router", groupable:false, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.vrouter);}}},
        {select:"sourcevn", display:{id:"sourcevn",field:"sourcevn", width:250, name:"Source VN", groupable:false, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.sourcevn);}}},
        {select:"destvn", display:{id:"destvn", field:"destvn", width:250, name:"Destination VN", groupable:false, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.destvn);}}},
        {select:"sourceip", display:{id:"sourceip", field:"sourceip", width:120, name:"Source IP", groupable:false, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.sourceip);}}},
        {select:"destip", display:{id:"destip", field:"destip", width:120, name:"Destination IP", groupable:false, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.destip);}}},
        {select:"sport", display:{id:"sport", field:"sport", width:120, name:"Source Port", groupable:false, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.sport);}}},
        {select:"dport", display:{id:"dport", field:"dport", width:120, name:"Destination Port", groupable:false, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.dport);}}},
        {select:"direction_ing", display:{id:"direction_ing", field:"direction_ing", width:120, name:"Direction", groupable:true, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(getDirName(dc.direction_ing));}}},
        {select:"protocol", display:{id:"protocol", field:"protocol", width:100, name:"Protocol", groupable:true, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(getProtocolName(dc.protocol));}}},
        {select:"bytes", display:{id:"bytes", field:"bytes", width:120, name:"Bytes", format:"{0:n0}", groupable:false}},
        {select:"sum(bytes)", display:{id:"sum_bytes", field:"sum_bytes", width:100, name:"SUM(Bytes)", format:"{0:n0}", groupable:false}},
        {select:"avg(bytes)", display:{id:"avg_bytes", field:"avg_bytes", width:100, name:"AVG(Bytes)", format:"{0:n0}", groupable:false}},
        {select:"packets", display:{id:"packets", field:"packets", width:100, name:"Packets", format:"{0:n0}", groupable:false}},
        {select:"sum(packets)", display:{id:"sum_packets", field:"sum_packets", width:100, name:"SUM(Packets)", format:"{0:n0}", groupable:false}},
        {select:"avg(packets)", display:{id:"avg_packets", field:"avg_packets", width:100, name:"AVG(Packets)", format:"{0:n0}", groupable:false}}
    ];

    var fcColumnDisplay = [
        {select:"sourcevn", display:{id:"sourcevn", field:"sourcevn", name:"Source VN", width:275, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.sourcevn);}}},
        {select:"destvn", display:{id:"destvn", field:"destvn", name:"Destination VN", width:275, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.destvn);}}},
        {select:"sourceip", display:{id:"sourceip", field:"sourceip", name:"Source IP", width:120, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.sourceip);}}},
        {select:"destip", display:{id:"destip", field:"destip", name:"Destination IP", width:120, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.destip);}}},
        {select:"sport", display:{id:"sport", field:"sport", name:"Source Port", width:120, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.sport);}}},
        {select:"dport", display:{id:"dport", field:"dport", name:"Destination Port", width:120, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.dport);}}},
        {select:"protocol", display:{id:"protocol", field:"protocol", name:"Protocol", width:80, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(getProtocolName(dc.protocol));}}}
    ];

    return QEGridConfig;
});