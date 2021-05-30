using Hcs.VirtualButtonBox.Models;
using Hcs.VirtualButtonBox.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Hcs.VirtualButtonBox.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VjoyController : ControllerBase
    {
        private readonly VJoyConfig vJoyConfig;
        private readonly ISettingStorage settings;
        private readonly VJoyFeeder feeder;

        public VjoyController(VJoyConfig vJoyConfig, ISettingStorage settings, VJoyFeeder feeder)
        {
            this.vJoyConfig = vJoyConfig;
            this.settings = settings;
            this.feeder = feeder;
        }
        [HttpGet]
        public async ValueTask<IActionResult> GetAsync()
        {

            if (!vJoyConfig.Installed)
            {
                return NotInstalled();
            }
            var basic = await settings.GetAsync<DeviceSettings>("device");
            var data = await vJoyConfig.GetDeviceInfoAsync();
            var used = basic.UseDevices ?? Array.Empty<int>();
            foreach (var d in data)
            {
                d.Used = used.Contains(d.Id);
            }
            return Ok(new { installed = true, vjoys = data, details = await vJoyConfig.GetVJoyDeviceDetailInfoAsync(used) });
        }
        IActionResult NotInstalled()
        {
            return Ok(new { installed = false, message = $"vjoy not installed({ vJoyConfig.Folder})", vjoys = Enumerable.Empty<VJoyConfig>() });

        }

        [HttpPost("hw/{id:int}")]
        public async ValueTask<IActionResult> HwPostAsync(int id)
        {
            if (!vJoyConfig.Installed)
            {
                return NotInstalled();
            }
            await vJoyConfig.CreateDeviceAsync(id);
            await feeder.ClaimJoysAsync();
            return await GetAsync();
        }
        [HttpDelete("hw/{id:int}")]
        public async ValueTask<IActionResult> HwDeleteAsync(int id)
        {
            if (!vJoyConfig.Installed)
            {
                return NotInstalled();
            }
            await vJoyConfig.DeleteDeviceAsync(id);

            return await DeleteAsync(id);
        }

        [HttpPost("{id:int}")]
        public async ValueTask<IActionResult> PostAsync(int id)
        {
            if (!vJoyConfig.Installed)
            {
                return NotInstalled();
            }
            var data = await vJoyConfig.GetDeviceInfoAsync();

            await settings.UpdateAsync<DeviceSettings>("device", ctx =>
            {
                ctx.UseDevices = (ctx.UseDevices ?? Array.Empty<int>()).Append(id).ToArray();
            });
            if (data.Any(x => x.Id == id && x.Status == "MISSING"))
            {
                await HwPostAsync(id);
            }
            await feeder.ClaimJoysAsync();
            return await GetAsync();
        }
        [HttpDelete("{id:int}")]
        public async ValueTask<IActionResult> DeleteAsync(int id)
        {
            if (!vJoyConfig.Installed)
            {
                return NotInstalled();
            }
            await settings.UpdateAsync<DeviceSettings>("device", ctx =>
            {
                ctx.UseDevices = (ctx.UseDevices ?? Array.Empty<int>()).Where(x => x != id).ToArray();
            });
            await feeder.ClaimJoysAsync();
            return await GetAsync();
        }
    }
}
