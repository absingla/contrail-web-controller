/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
    var methods = {};
    module.exports= {
        methods : methods
    };

    methods.domainsMockData = function(){
        return{
            "domains": [
                {
                    "href"   : "http://10.84.11.2:8082/domain/35468934-bfe5-4c0e-84e2-ddfc9b49af74",
                    "fq_name": [
                        "default-domain"
                    ],
                    "uuid"   : "35468934-bfe5-4c0e-84e2-ddfc9b49af74"
                }
            ]
        }
    };
    methods.empty = function(){
        return {
        }
    };

    methods.tenantsNetworkMockData = function(){
        return {
            "virtual-networks": [
                {
                    "href": "http://10.84.11.2:8082/virtual-network/363d3863-950c-4375-8440-e46df9f862d1",
                    "fq_name": [
                        "default-domain",
                        "p_500_vn",
                        "p_500_vn1"
                    ],
                    "uuid": "363d3863-950c-4375-8440-e46df9f862d1"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/47eb9bb7-047b-41d1-bfdf-a186ef16773a",
                    "fq_name": [
                        "default-domain",
                        "p_500_vn",
                        "p_500_vn2"
                    ],
                    "uuid": "47eb9bb7-047b-41d1-bfdf-a186ef16773a"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/d9826220-6c94-4582-82dd-4bfe487392ff",
                    "fq_name": [
                        "default-domain",
                        "p_500_vn",
                        "p_500_vn3"
                    ],
                    "uuid": "d9826220-6c94-4582-82dd-4bfe487392ff"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/6db31949-afeb-4e62-9415-3c822e1773a1",
                    "fq_name": [
                        "default-domain",
                        "p_500_vn",
                        "p_500_vn4"
                    ],
                    "uuid": "6db31949-afeb-4e62-9415-3c822e1773a1"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/c8587ae4-d5cd-4834-b8a1-1a5db9bf6ecb",
                    "fq_name": [
                        "default-domain",
                        "p_500_vn",
                        "p_500_vn5"
                    ],
                    "uuid": "c8587ae4-d5cd-4834-b8a1-1a5db9bf6ecb"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/da5381d9-b68c-4762-b248-7c00c30afc2b",
                    "fq_name": [
                        "default-domain",
                        "p_500_vn",
                        "p_500_vn6"
                    ],
                    "uuid": "da5381d9-b68c-4762-b248-7c00c30afc2b"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/9ec91677-ae40-44e1-8996-ea9ff2e11901",
                    "fq_name": [
                        "default-domain",
                        "p_500_vn",
                        "p_500_vn7"
                    ],
                    "uuid": "9ec91677-ae40-44e1-8996-ea9ff2e11901"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/ad4ad3c7-8520-4375-adbd-45ad6a2aef89",
                    "fq_name": [
                        "default-domain",
                        "p_500_vn",
                        "p_500_vn8"
                    ],
                    "uuid": "ad4ad3c7-8520-4375-adbd-45ad6a2aef89"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/f0203b8b-0a6b-4cb9-84f7-21efbbb51277",
                    "fq_name": [
                        "default-domain",
                        "p_500_vn",
                        "p_500_vn9"
                    ],
                    "uuid": "f0203b8b-0a6b-4cb9-84f7-21efbbb51277"
                },
                {
                    "href": "http://10.84.11.2:8082/virtual-network/5243ac99-c61b-4eec-a1c3-7f20bd343009",
                    "fq_name": [
                        "default-domain",
                        "p_500_vn",
                        "p_500_vn10"
                    ],
                    "uuid": "5243ac99-c61b-4eec-a1c3-7f20bd343009"
                }
            ]
        }
    };

    methods.networkingStatsMockData = function(){
        return[
            {
                "value": [
                    {
                        "name": "default-domain:admin:backend",
                        "SUM(vn_stats.in_bytes)": 55374864,
                        "SUM(vn_stats.in_tpkts)": 165032,
                        "SUM(vn_stats.out_bytes)": 55166624,
                        "SUM(vn_stats.out_tpkts)": 164956
                    },
                    {
                        "name": "default-domain:admin:frontend",
                        "SUM(vn_stats.in_bytes)": 55166624,
                        "SUM(vn_stats.in_tpkts)": 164956,
                        "SUM(vn_stats.out_bytes)": 55374864,
                        "SUM(vn_stats.out_tpkts)": 165032
                    }
                ]
            }
        ]
    };
    methods.virtualMachineInterfacesMockData = function(){
        return {
            "value": [
                {
                    "name": "default-domain:demo:st101_port21",
                    "value": {
                        "UveVMInterfaceAgent": {
                            "vm_name": "st_vn101_vm21",
                            "in_bw_usage": 0,
                            "virtual_network": "default-domain:demo:st_vn101",
                            "uuid": "485317a8-d1e9-4397-9e4f-9aba97170947",
                            "out_bw_usage": 0,
                            "ip6_active": false,
                            "label": 104,
                            "if_stats": {
                                "out_bytes": 270,
                                "in_bytes": 0,
                                "in_pkts": 0,
                                "out_pkts": 3
                            },
                            "vm_uuid": "0275be58-4e5f-440e-81fa-07aac3fb1623",
                            "port_bucket_bmap": {
                                "udp_sport_bitmap": [
                                    "0",
                                    "0",
                                    "0",
                                    "0",
                                    "0",
                                    "0",
                                    "0",
                                    "0"
                                ],
                                "tcp_dport_bitmap": [
                                    "1",
                                    "0",
                                    "0",
                                    "0",
                                    "0",
                                    "0",
                                    "0",
                                    "0"
                                ],
                                "tcp_sport_bitmap": [
                                    "0",
                                    "0",
                                    "0",
                                    "0",
                                    "0",
                                    "0",
                                    "8192",
                                    "0"
                                ],
                                "udp_dport_bitmap": [
                                    "0",
                                    "0",
                                    "0",
                                    "0",
                                    "0",
                                    "0",
                                    "0",
                                    "0"
                                ]
                            },
                            "mac_address": "02:48:53:17:a8:d1",
                            "active": true,
                            "ip6_address": "::",
                            "l2_active": true,
                            "ip_address": "1.101.1.23",
                            "gateway": "1.101.1.1"
                        }
                    }
                }
            ]
        }
    };
    methods.projectMockData = function(){
        return{
            "projects": [
                {
                    "uuid"   : "ba710bf3-922d-4cda-bbb4-a2e2e76533bf",
                    "fq_name": [
                        "default-domain",
                        "admin"
                    ]
                },
                {
                    "uuid"   : "c3fa1bb4-b04d-4f29-8bb4-7343d8fbeb21",
                    "fq_name": [
                        "default-domain",
                        "scalevns"
                    ]
                },
                {
                    "uuid"   : "efdfd856-b362-4b5c-ad17-09cc3acfd859",
                    "fq_name": [
                        "default-domain",
                        "demo"
                    ]
                }
            ]
        }
    };
    methods.adminProjectMockData = function(){
            return{
            "virtual-networks": [
                {
                    "href"   : "http://10.84.11.2:8082/virtual-network/ad8a9efc-9b7e-4425-9735-03bda0d2726e",
                    "fq_name": [
                        "default-domain",
                        "admin",
                        "frontend"
                    ],
                    "uuid"   : "ad8a9efc-9b7e-4425-9735-03bda0d2726e"
                },
                {
                    "href"   : "http://10.84.11.2:8082/virtual-network/2847747f-cb2c-4499-9b12-0f1711168e72",
                    "fq_name": [
                        "default-domain",
                        "admin",
                        "backend"
                    ],
                    "uuid"   : "2847747f-cb2c-4499-9b12-0f1711168e72"
                }
            ]
        }
    };
        methods.virtualMachinesMockData = function(){
            return{
            "data"   : {
                "value": [
                    {
                        "name" : "39b35cf1-1bdf-4238-bcc2-16653f12379a",
                        "value": {
                            "UveVirtualMachineAgent": {
                                "vm_name"       : "back01",
                                "cpu_info"      : {
                                    "virt_memory"         : 6749812,
                                    "cpu_one_min_avg"     : 1.16667,
                                    "disk_used_bytes"     : 1167990784,
                                    "vm_memory_quota"     : 4194304,
                                    "peak_virt_memory"    : 7251764,
                                    "disk_allocated_bytes": 4294967295,
                                    "rss"                 : 1265084
                                },
                                "interface_list": [
                                    "default-domain:admin:4b5073eb-ee2e-4790-b106-e020a4e79e45"
                                ],
                                "uuid"          : "39b35cf1-1bdf-4238-bcc2-16653f12379a",
                                "vrouter"       : "a3s29"
                            }
                        }
                    },
                    {
                        "name" : "7c20fb79-1a0a-49e3-b31f-d53db046264e",
                        "value": {
                            "UveVirtualMachineAgent": {
                                "vm_name"       : "front01",
                                "cpu_info"      : {
                                    "virt_memory"         : 6757960,
                                    "cpu_one_min_avg"     : 0.983607,
                                    "disk_used_bytes"     : 1173041152,
                                    "vm_memory_quota"     : 4194304,
                                    "peak_virt_memory"    : 7250968,
                                    "disk_allocated_bytes": 4294967295,
                                    "rss"                 : 1253528
                                },
                                "interface_list": [
                                    "default-domain:admin:3683aa58-28ff-4ffb-8667-fb778d92ad0e"
                                ],
                                "uuid"          : "7c20fb79-1a0a-49e3-b31f-d53db046264e",
                                "vrouter"       : "a3s29"
                            }
                        }
                    }
                ]
            },
            "lastKey": null,
            "more"   : false
        }
        };
        methods.virtualMachinesMockStatData = function(){
            return [
                {
                    "value": [
                        {
                            "vm_uuid"                : "39b35cf1-1bdf-4238-bcc2-16653f12379a",
                            "SUM(if_stats.in_bytes)" : 55450416,
                            "SUM(if_stats.in_pkts)"  : 164816,
                            "SUM(if_stats.out_bytes)": 55048214,
                            "SUM(if_stats.out_pkts)" : 164659
                        },
                        {
                            "vm_uuid"                : "7c20fb79-1a0a-49e3-b31f-d53db046264e",
                            "SUM(if_stats.in_bytes)" : 55048214,
                            "SUM(if_stats.in_pkts)"  : 164659,
                            "SUM(if_stats.out_bytes)": 55450416,
                            "SUM(if_stats.out_pkts)" : 164816
                        }
                    ]
                }
                    ]
            };
        methods.virtualMachinesInterfacesMockData = function(){
            return{
            "value": [
                {
                    "name" : "default-domain:admin:4b5073eb-ee2e-4790-b106-e020a4e79e45",
                    "value": {
                        "UveVMInterfaceAgent": {
                            "vm_name"        : "back01",
                            "ip6_active"     : false,
                            "if_stats"       : {
                                "out_bytes": 436110,
                                "in_bytes" : 451574,
                                "in_pkts"  : 1327,
                                "out_pkts" : 1327
                            },
                            "ip6_address"    : "::",
                            "virtual_network": "default-domain:admin:backend",
                            "ip_address"     : "10.3.1.3"
                        }
                    }
                },
                {
                    "name" : "default-domain:admin:3683aa58-28ff-4ffb-8667-fb778d92ad0e",
                    "value": {
                        "UveVMInterfaceAgent": {
                            "vm_name"        : "front01",
                            "ip6_active"     : false,
                            "if_stats"       : {
                                "out_bytes": 451574,
                                "in_bytes" : 436110,
                                "in_pkts"  : 1327,
                                "out_pkts" : 1327
                            },
                            "ip6_address"    : "::",
                            "virtual_network": "default-domain:admin:frontend",
                            "ip_address"     : "10.2.1.3"
                        }
                    }
                }
            ]
        }
        };

