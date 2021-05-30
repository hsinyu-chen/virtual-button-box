using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Hcs.VirtualButtonBox.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SettingsController : ControllerBase
    {
        private readonly ISettingStorage settingStorage;

        public SettingsController(ISettingStorage settingStorage)
        {
            this.settingStorage = settingStorage;

        }
        [HttpGet("{key}")]
        public async ValueTask<IActionResult> GetAsync(string key)
        {
            var obj = await settingStorage.GetAsync<JObject>("settings");
            return Ok(obj[key]);
        }
        [HttpPut("{key}")]
        public async ValueTask<IActionResult> UpdateAsync(string key, [FromBody] JToken data)
        {
            await settingStorage.UpdateAsync<JObject>("settings", obj =>
            {
                obj[key] = data;
            });
            return Ok();
        }
    }
}
