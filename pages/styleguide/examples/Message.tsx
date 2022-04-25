import Example from '../Example';
import Message from '../../../components/Message';

const STACK_TRACE_EXAMPLE = `
Apr 07 04:38:57 ip-10-0-74-131 kernel: watchdog: BUG: soft lockup - CPU#1 stuck for 22s! [kauditd:22]
Apr 07 04:38:57 ip-10-0-74-131 kernel: Modules linked in: ppdev serio_raw parport_pc parport sch_fq_codel ip_tables x_tables autofs4 btrfs zstd_compress raid10 raid456 async_raid6_recov async_memcpy async_pq async_xor async_tx xor raid6_pq libcrc32c raid1 raid0 multipath linear crct10dif_pclmul crc32_pclmul ghash_clmulni_intel aesni_intel crypto_simd cryptd glue_helper ena
Apr 07 04:38:57 ip-10-0-74-131 kernel: CPU: 1 PID: 22 Comm: kauditd Not tainted 5.4.0-1071-aws #76~18.04.1-Ubuntu
Apr 07 04:38:57 ip-10-0-74-131 kernel: Hardware name: Amazon EC2 t3.small/, BIOS 1.0 10/16/2017
Apr 07 04:38:57 ip-10-0-74-131 kernel: RIP: 0010:_raw_spin_unlock_irqrestore+0x15/0x20
Apr 07 04:38:57 ip-10-0-74-131 kernel: Code: e8 b0 a3 65 ff 4c 29 e0 4c 39 f0 76 cf 80 0b 08 eb 8a 90 90 90 0f 1f 44 00 00 55 48 89 e5 e8 66 0c 68 ff 66 90 48 89 f7 57 9d &lt;0f&gt; 1f 44 00 00 5d c3 0f 1f 40 00 0f 1f 44 00 00 55 48 89 e5 c6 07
Apr 07 04:38:57 ip-10-0-74-131 kernel: RSP: 0018:ffffa385c00cbe08 EFLAGS: 00000246 ORIG_RAX: ffffffffffffff13
Apr 07 04:38:57 ip-10-0-74-131 kernel: RAX: 0000000000000001 RBX: ffffffff96fd3b70 RCX: 0000000000000769
Apr 07 04:38:57 ip-10-0-74-131 kernel: RDX: 000000000000076a RSI: 0000000000000246 RDI: 0000000000000246
Apr 07 04:38:57 ip-10-0-74-131 kernel: RBP: ffffa385c00cbe08 R08: 0000000000000000 R09: ffffffff958b4801
Apr 07 04:38:57 ip-10-0-74-131 kernel: R10: ffffa385c00cbd98 R11: 0000000000000000 R12: ffff907db699ff00
Apr 07 04:38:57 ip-10-0-74-131 kernel: R13: ffffffff96fd3b84 R14: ffff907db699ffd4 R15: ffff907db699ff00
Apr 07 04:38:57 ip-10-0-74-131 kernel: FS:  0000000000000000(0000) GS:ffff907dfb500000(0000) knlGS:0000000000000000
Apr 07 04:38:57 ip-10-0-74-131 kernel: CS:  0010 DS: 0000 ES: 0000 CR0: 0000000080050033
Apr 07 04:38:57 ip-10-0-74-131 kernel: CR2: 000055c63d5d9ee0 CR3: 0000000008a0a006 CR4: 00000000007606e0
Apr 07 04:38:57 ip-10-0-74-131 kernel: DR0: 0000000000000000 DR1: 0000000000000000 DR2: 0000000000000000
Apr 07 04:38:57 ip-10-0-74-131 kernel: DR3: 0000000000000000 DR6: 00000000fffe0ff0 DR7: 0000000000000400
Apr 07 04:38:57 ip-10-0-74-131 kernel: PKRU: 55555554
Apr 07 04:38:57 ip-10-0-74-131 kernel: Call Trace:
Apr 07 04:38:57 ip-10-0-74-131 kernel:  skb_queue_head+0x47/0x50
Apr 07 04:38:57 ip-10-0-74-131 kernel:  kauditd_rehold_skb+0x18/0x20
Apr 07 04:38:57 ip-10-0-74-131 kernel:  kauditd_send_queue+0xb6/0xf0
Apr 07 04:38:57 ip-10-0-74-131 kernel:  ? kauditd_retry_skb+0x20/0x20
Apr 07 04:38:57 ip-10-0-74-131 kernel:  kauditd_thread+0xa0/0x250
Apr 07 04:38:57 ip-10-0-74-131 kernel:  ? __wake_up_pollfree+0x40/0x40
Apr 07 04:38:57 ip-10-0-74-131 kernel:  kthread+0x121/0x140
Apr 07 04:38:57 ip-10-0-74-131 kernel:  ? auditd_reset+0xa0/0xa0
`.trim();

export default function Styleguide() {
  return (
    <Example header="Message">
      <Message text="Hello, world!" />
      <Message text="Hello, world! :)" />
      <Message text="Hey, <@John>!" />
      <Message text="Hey, <@John>!" />
      <Message text="Hey, <https://linen.dev>!" />
      <Message text="Hey, <http://linen.dev>!" />
      <Message text="Hey, `const answer = 42`!" />
      <Message text="Has anyone ran into this error before? Just trying to run a spec. Other things like `db:migrate` fail for `PG:InsufficientPrivilege` as well. ```An error occured while loading ./spec/models/user.rb```" />
      <Message text={`\`\`\`${STACK_TRACE_EXAMPLE}\`\`\``} />
    </Example>
  );
}
