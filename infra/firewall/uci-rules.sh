#!/bin/sh
# OpenWrt UCI Shell Script to enforce Layer 2 Bypass Prevention

# 1. Force Port 53 DNS Redirection to AdGuard Home
uci add firewall redirect
uci set firewall.@redirect[-1].name='Force-AdGuard-DNS-UDP'
uci set firewall.@redirect[-1].src='lan'
uci set firewall.@redirect[-1].src_dport='53'
uci set firewall.@redirect[-1].dest_ip='192.168.30.2'
uci set firewall.@redirect[-1].dest_port='53'
uci set firewall.@redirect[-1].proto='udp'
uci set firewall.@redirect[-1].target='DNAT'

# 2. Block Public DoT (Port 853)
uci add firewall rule
uci set firewall.@rule[-1].name='Block-DoT-Port853'
uci set firewall.@rule[-1].src='lan'
uci set firewall.@rule[-1].dest='wan'
uci set firewall.@rule[-1].dest_port='853'
uci set firewall.@rule[-1].proto='tcp udp'
uci set firewall.@rule[-1].target='DROP'

# 3. Block Public DoH Bootstrap IPs
uci add firewall rule
uci set firewall.@rule[-1].name='Block-Public-DoH-Google'
uci set firewall.@rule[-1].src='lan'
uci set firewall.@rule[-1].dest='wan'
uci set firewall.@rule[-1].dest_ip='8.8.8.8 8.8.4.4 1.1.1.1 9.9.9.9'
uci set firewall.@rule[-1].dest_port='443'
uci set firewall.@rule[-1].proto='tcp'
uci set firewall.@rule[-1].target='DROP'

uci commit firewall
/etc/init.d/firewall restart
echo "OpenWrt Layer 2 Firewall rules committed successfully."
