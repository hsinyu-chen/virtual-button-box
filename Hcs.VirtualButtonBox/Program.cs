using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Hcs.VirtualButtonBox
{
    public class Program
    {
        const string AppId = "70f8fdce-91b2-42ab-92e8-b62687f07f79";
        public static void Main(string[] args)
        {
            using Mutex mutex = new Mutex(false, "Global\\" + AppId);
            if (!mutex.WaitOne(0, false))
            {
                return;
            }
            var icon = new NotifyIcon
            {
                Icon = new System.Drawing.Icon("./icon.ico"),
                Visible = true
            };
            var host = CreateHostBuilder(args).Build();
            icon.ContextMenuStrip = new();
            icon.ContextMenuStrip.Items.Add("Exit", null, async (s, e) =>
             {
                 icon.Visible = false;
                 icon.Dispose();
                 host.Dispose();
                 
                 Application.Exit();
             });
            host.StartAsync();
            Application.Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}
