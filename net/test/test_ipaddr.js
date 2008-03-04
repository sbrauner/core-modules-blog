core.net.ipaddr();

ips = ["192.168.1.1", "127.0.0.1", "10.0.0.24", "64.233.161.104", "87.248.113.14"];
for(i in ips){
    s = ips[i];
    assert(net.isIPAddr(s));
}

notips = ["Dana", " 192.168.1.1", "hi 192.168.1.1", "100.000.0000.000"];
for(i in notips){
    s = notips[i];
    assert(! net.isIPAddr(s));
}

exit();
