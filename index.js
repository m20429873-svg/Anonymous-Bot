require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder
} = require("discord.js");

const fs = require("fs");

// =====================================================
// CONFIG
// =====================================================

const TOKEN = process.env.TOKEN;

const SERVER_NAME = "المجهول";

// روم الترحيب
const WELCOME_CHANNEL_ID = "1551284887707984065";

// =====================================================
// ROLE IDS
// =====================================================

const ROLES = {
  VISITOR: "1551288757213339668",

  ASSISTANT: "1551288076809019463",
  MODERATOR: "1551287820608344074",
  ADMIN: "1551287607453941770",
  SENIOR_ADMIN: "1551287406806827008",
  OWNER: "1551287263055450123"
};

// =====================================================
// STAFF ROLES
// =====================================================

const STAFF_ROLES = [
  ROLES.ASSISTANT,
  ROLES.MODERATOR,
  ROLES.ADMIN,
  ROLES.SENIOR_ADMIN,
  ROLES.OWNER
];

// الرتب التي تستطيع استخدام /warn
const WARN_ROLES = [
  ROLES.MODERATOR,
  ROLES.ADMIN,
  ROLES.SENIOR_ADMIN,
  ROLES.OWNER
];

// =====================================================
// DATA
// =====================================================

const DATA_FILE = "./data.json";

let data = {
  points: {},
  warnings: {},
  tickets: {},
  salary: {}
};

if (fs.existsSync(DATA_FILE)) {
  try {

    data = JSON.parse(
      fs.readFileSync(DATA_FILE, "utf8")
    );

    if (!data.points) data.points = {};
    if (!data.warnings) data.warnings = {};
    if (!data.tickets) data.tickets = {};
    if (!data.salary) data.salary = {};

  } catch (error) {

    console.error(
      "❌ خطأ في قراءة data.json:",
      error
    );

    data = {
      points: {},
      warnings: {},
      tickets: {},
      salary: {}
    };

  }
}

function saveData() {

  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(data, null, 2)
  );

}

// =====================================================
// CLIENT
// =====================================================

const client = new Client({

  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]

});

// =====================================================
// HELPERS
// =====================================================

function hasRole(member, roleId) {

  return member.roles.cache.has(roleId);

}

function isStaff(member) {

  return STAFF_ROLES.some(roleId =>
    member.roles.cache.has(roleId)
  );

}

function canWarn(member) {

  return WARN_ROLES.some(roleId =>
    member.roles.cache.has(roleId)
  );

}

function isOwner(member) {

  return hasRole(
    member,
    ROLES.OWNER
  );

}

// =====================================================
// ROLE NAME
// =====================================================

function getRoleName(member) {

  if (
    hasRole(
      member,
      ROLES.OWNER
    )
  )
    return "المالك・👑";

  if (
    hasRole(
      member,
      ROLES.SENIOR_ADMIN
    )
  )
    return "الإدارة العليا・🛡️";

  if (
    hasRole(
      member,
      ROLES.ADMIN
    )
  )
    return "إداري・⚔️";

  if (
    hasRole(
      member,
      ROLES.MODERATOR
    )
  )
    return "مشرف・🔰";

  if (
    hasRole(
      member,
      ROLES.ASSISTANT
    )
  )
    return "مساعد・🛡️";

  return "زائر・👤";

}

// =====================================================
// ADD POINTS
// =====================================================

function addPoints(userId, amount) {

  if (!data.points[userId]) {

    data.points[userId] = 0;

  }

  data.points[userId] += amount;

  if (
    data.points[userId] < 0
  ) {

    data.points[userId] = 0;

  }

  saveData();

}

// =====================================================
// ADD SALARY
// =====================================================

function addSalary(userId, amount) {

  if (!data.salary[userId]) {

    data.salary[userId] = 0;

  }

  data.salary[userId] += amount;

  if (
    data.salary[userId] < 0
  ) {

    data.salary[userId] = 0;

  }

  saveData();

}

// =====================================================
// SLASH COMMANDS
// =====================================================

const commands = [

  // /points
  new SlashCommandBuilder()

    .setName("points")

    .setDescription(
      "عرض نقاط وراتب شخص"
    )

    .addUserOption(option =>
      option

        .setName("person")

        .setDescription(
          "الشخص"
        )

        .setRequired(true)
    ),

  // /salary
  new SlashCommandBuilder()

    .setName("salary")

    .setDescription(
      "عرض راتبك أو راتب شخص"
    )

    .addUserOption(option =>
      option

        .setName("person")

        .setDescription(
          "الشخص"
        )

        .setRequired(false)
    ),

  // /profile
  new SlashCommandBuilder()

    .setName("profile")

    .setDescription(
      "عرض بروفايل موظف"
    )

    .addUserOption(option =>
      option

        .setName("person")

        .setDescription(
          "الشخص"
        )

        .setRequired(false)
    ),

  // /addpoints
  new SlashCommandBuilder()

    .setName("addpoints")

    .setDescription(
      "إضافة نقاط لشخص"
    )

    .addUserOption(option =>
      option

        .setName("person")

        .setDescription(
          "الشخص"
        )

        .setRequired(true)
    )

    .addIntegerOption(option =>
      option

        .setName("amount")

        .setDescription(
          "عدد النقاط"
        )

        .setRequired(true)

        .setMinValue(1)
    ),

  // /minus
  new SlashCommandBuilder()

    .setName("minus")

    .setDescription(
      "خصم نقاط من شخص"
    )

    .addUserOption(option =>
      option

        .setName("person")

        .setDescription(
          "الشخص"
        )

        .setRequired(true)
    )

    .addIntegerOption(option =>
      option

        .setName("amount")

        .setDescription(
          "عدد النقاط"
        )

        .setRequired(true)

        .setMinValue(1)
    ),

  // /warn
  new SlashCommandBuilder()

    .setName("warn")

    .setDescription(
      "تحذير عضو"
    )

    .addUserOption(option =>
      option

        .setName("person")

        .setDescription(
          "الشخص"
        )

        .setRequired(true)
    )

    .addStringOption(option =>
      option

        .setName("reason")

        .setDescription(
          "سبب التحذير"
        )

        .setRequired(true)
    ),

  // /clear
  new SlashCommandBuilder()

    .setName("clear")

    .setDescription(
      "مسح عدد من الرسائل"
    )

    .addIntegerOption(option =>
      option

        .setName("amount")

        .setDescription(
          "عدد الرسائل"
        )

        .setRequired(true)

        .setMinValue(1)

        .setMaxValue(100)
    ),

  // /setup-ticket
  new SlashCommandBuilder()

    .setName("setup-ticket")

    .setDescription(
      "إنشاء لوحة التذاكر"
    )

].map(
  command => command.toJSON()
);

// =====================================================
// READY
// =====================================================

client.once(
  "ready",
  async () => {

    console.log(
      `✅ ${client.user.tag} Online`
    );

    client.user.setPresence({

      activities: [
        {
          name: "「 المجهول 」",
          type: 3
        }
      ],

      status: "online"

    });

    try {

      await client.application.commands.set(
        commands
      );

      console.log(
        `✅ تم تسجيل ${commands.length} أوامر Slash بنجاح`
      );

    } catch (error) {

      console.error(
        "❌ Command Registration Error:",
        error
      );

    }

  }
);

// =====================================================
// MEMBER JOIN
// =====================================================

client.on(
  "guildMemberAdd",
  async member => {

    // =================================================
    // إضافة رتبة الزائر
    // =================================================

    try {

      const visitorRole =
        member.guild.roles.cache.get(
          ROLES.VISITOR
        );

      if (visitorRole) {

        if (
          !member.roles.cache.has(
            ROLES.VISITOR
          )
        ) {

          await member.roles.add(
            visitorRole,
            "تسجيل عضو جديد"
          );

          console.log(
            `👤 Visitor role added to ${member.user.tag}`
          );

        }

      } else {

        console.log(
          "❌ Visitor role not found"
        );

      }

    } catch (error) {

      console.error(
        "❌ Could not add visitor role:",
        error
      );

    }

    // =================================================
    // رسالة الترحيب
    // =================================================

    try {

      const welcomeChannel =
        member.guild.channels.cache.get(
          WELCOME_CHANNEL_ID
        );

      if (!welcomeChannel) {

        console.log(
          "❌ Welcome channel not found"
        );

        return;

      }

      if (
        !welcomeChannel.isTextBased()
      ) {

        console.log(
          "❌ Welcome channel is not a text channel"
        );

        return;

      }

      const embed =
        new EmbedBuilder()

          .setTitle(
            "🕶️ أهلاً بك في 「 المجهول 」"
          )

          .setDescription(
            `أهلاً وسهلاً ${member} 👋\n\n` +
            `نورت **${SERVER_NAME}**!\n` +
            `نتمنى لك وقتًا ممتعًا معنا.\n\n` +
            `🕶️ **استكشف السيرفر وكن واحدًا من المجهولين.**`
          )

          .setThumbnail(
            member.user.displayAvatarURL({
              size: 256
            })
          )

          .setColor(
            0x2b2d31
          )

          .setTimestamp();

      await welcomeChannel.send({

        content:
          `${member}`,

        embeds: [
          embed
        ]

      });

      console.log(
        `👋 Welcome message sent for ${member.user.tag}`
      );

    } catch (error) {

      console.error(
        "❌ Could not send welcome message:",
        error
      );

    }

  }
);

// =====================================================
// INTERACTIONS
// =====================================================

client.on(
  "interactionCreate",
  async interaction => {

    try {

      // =================================================
      // SLASH COMMANDS
      // =================================================

      if (
        interaction.isChatInputCommand()
      ) {

        // ===============================================
        // /points
        // ===============================================

        if (
          interaction.commandName ===
          "points"
        ) {

          const user =
            interaction.options.getUser(
              "person"
            );

          const member =
            await interaction.guild.members
              .fetch(user.id)
              .catch(() => null);

          const points =
            data.points[user.id] || 0;

          const salary =
            data.salary[user.id] || 0;

          const roleName =
            member
              ? getRoleName(member)
              : "غير معروف";

          const embed =
            new EmbedBuilder()

              .setTitle(
                "⭐ معلومات الموظف"
              )

              .setDescription(
                `👤 **العضو:** ${user}\n` +
                `🏷️ **الرتبة:** ${roleName}\n` +
                `⭐ **النقاط:** ${points}\n` +
                `💰 **الراتب:** ${salary}`
              )

              .setThumbnail(
                user.displayAvatarURL({
                  size: 256
                })
              )

              .setColor(
                0x2b2d31
              )

              .setTimestamp();

          return interaction.reply({
            embeds: [embed]
          });

        }

        // ===============================================
        // /salary
        // ===============================================

        if (
          interaction.commandName ===
          "salary"
        ) {

          const user =
            interaction.options.getUser(
              "person"
            ) ||
            interaction.user;

          const salary =
            data.salary[user.id] || 0;

          const points =
            data.points[user.id] || 0;

          const member =
            await interaction.guild.members
              .fetch(user.id)
              .catch(() => null);

          const roleName =
            member
              ? getRoleName(member)
              : "غير معروف";

          const embed =
            new EmbedBuilder()

              .setTitle(
                "💰 معلومات الراتب"
              )

              .setDescription(
                `👤 **العضو:** ${user}\n` +
                `🏷️ **الرتبة:** ${roleName}\n` +
                `💰 **الراتب:** ${salary}\n` +
                `⭐ **النقاط:** ${points}`
              )

              .setThumbnail(
                user.displayAvatarURL({
                  size: 256
                })
              )

              .setColor(
                0x2b2d31
              )

              .setTimestamp();

          return interaction.reply({
            embeds: [embed]
          });

        }

        // ===============================================
        // /profile
        // ===============================================

        if (
          interaction.commandName ===
          "profile"
        ) {

          const user =
            interaction.options.getUser(
              "person"
            ) ||
            interaction.user;

          const member =
            await interaction.guild.members
              .fetch(user.id)
              .catch(() => null);

          if (!member) {

            return interaction.reply({

              content:
                "❌ لم أجد هذا العضو.",

              ephemeral: true

            });

          }

          const points =
            data.points[user.id] || 0;

          const salary =
            data.salary[user.id] || 0;

          const warnings =
            data.warnings[user.id] || 0;

          const roleName =
            getRoleName(member);

          const joinedAt =
            member.joinedAt

              ? `<t:${Math.floor(
                  member.joinedAt.getTime() /
                  1000
                )}:R>`

              : "غير معروف";

          const embed =
            new EmbedBuilder()

              .setTitle(
                `👤 بروفايل ${user.username}`
              )

              .setDescription(
                `👤 **العضو:** ${user}\n\n` +
                `🏷️ **الرتبة:** ${roleName}\n` +
                `⭐ **النقاط:** ${points}\n` +
                `💰 **الراتب:** ${salary}\n` +
                `⚠️ **التحذيرات:** ${warnings}\n` +
                `📅 **دخل السيرفر:** ${joinedAt}`
              )

              .setThumbnail(
                user.displayAvatarURL({
                  size: 512
                })
              )

              .setColor(
                0x2b2d31
              )

              .setTimestamp();

          return interaction.reply({
            embeds: [embed]
          });

        }

        // ===============================================
        // /addpoints
        // ===============================================

        if (
          interaction.commandName ===
          "addpoints"
        ) {

          if (
            !isOwner(
              interaction.member
            )
          ) {

            return interaction.reply({

              content:
                "❌ هذا الأمر للمالك فقط.",

              ephemeral: true

            });

          }

          const user =
            interaction.options.getUser(
              "person"
            );

          const amount =
            interaction.options.getInteger(
              "amount"
            );

          addPoints(
            user.id,
            amount
          );

          const total =
            data.points[user.id] || 0;

          const embed =
            new EmbedBuilder()

              .setTitle(
                "⭐ تمت إضافة النقاط"
              )

              .setDescription(
                `👤 **العضو:** ${user}\n` +
                `➕ **المضاف:** ${amount}\n` +
                `⭐ **إجمالي النقاط:** ${total}`
              )

              .setColor(
                0x2b2d31
              )

              .setTimestamp();

          return interaction.reply({
            embeds: [embed]
          });

        }

        // ===============================================
        // /minus
        // ===============================================

        if (
          interaction.commandName ===
          "minus"
        ) {

          if (
            !isOwner(
              interaction.member
            )
          ) {

            return interaction.reply({

              content:
                "❌ هذا الأمر للمالك فقط.",

              ephemeral: true

            });

          }

          const user =
            interaction.options.getUser(
              "person"
            );

          const amount =
            interaction.options.getInteger(
              "amount"
            );

          addPoints(
            user.id,
            -amount
          );

          const total =
            data.points[user.id] || 0;

          const embed =
            new EmbedBuilder()

              .setTitle(
                "➖ تم خصم النقاط"
              )

              .setDescription(
                `👤 **العضو:** ${user}\n` +
                `➖ **المخصوم:** ${amount}\n` +
                `⭐ **النقاط الحالية:** ${total}`
              )

              .setColor(
                0x2b2d31
              )

              .setTimestamp();

          return interaction.reply({
            embeds: [embed]
          });

        }

        // ===============================================
        // /warn
        // ===============================================

        if (
          interaction.commandName ===
          "warn"
        ) {

          if (
            !canWarn(
              interaction.member
            )
          ) {

            return interaction.reply({

              content:
                "❌ هذا الأمر متاح من رتبة **مشرف・🔰** وما فوق.",

              ephemeral: true

            });

          }

          const target =
            interaction.options.getMember(
              "person"
            );

          const reason =
            interaction.options.getString(
              "reason"
            );

          if (!target) {

            return interaction.reply({

              content:
                "❌ لم أجد هذا العضو.",

              ephemeral: true

            });

          }

          if (
            target.id ===
            interaction.user.id
          ) {

            return interaction.reply({

              content:
                "❌ لا يمكنك تحذير نفسك.",

              ephemeral: true

            });

          }

          if (
            target.user.bot
          ) {

            return interaction.reply({

              content:
                "❌ لا يمكن تحذير البوتات.",

              ephemeral: true

            });

          }

          const executorHighest =
            interaction.member.roles
              .highest.position;

          const targetHighest =
            target.roles
              .highest.position;

          if (
            targetHighest >=
              executorHighest &&
            target.id !==
              interaction.guild.ownerId
          ) {

            return interaction.reply({

              content:
                "❌ لا يمكنك تنفيذ العقوبة على شخص رتبته مساوية أو أعلى من رتبتك.",

              ephemeral: true

            });

          }

          if (
            !data.warnings[target.id]
          ) {

            data.warnings[target.id] = 0;

          }

          data.warnings[target.id]++;

          const warningNumber =
            data.warnings[target.id];

          saveData();

          // WARNING 1
          if (
            warningNumber === 1
          ) {

            return interaction.reply({

              content:
                `⚠️ **تحذير لك ${target}**\n` +
                `📌 السبب: **${reason}**\n\n` +
                `هذا هو التحذير الأول.`

            });

          }

          // WARNING 2
          if (
            warningNumber === 2
          ) {

            try {

              await target.timeout(

                24 * 60 * 60 * 1000,

                `التحذير الثاني: ${reason}`

              );

            } catch (error) {

              console.log(
                "Timeout Error:",
                error
              );

            }

            return interaction.reply({

              content:
                `⚠️ **تحذير لك ${target}**\n` +
                `📌 السبب: **${reason}**\n\n` +
                `🚫 هذا هو التحذير الثاني وتم إعطاؤك ميوت لمدة يوم.`

            });

          }

          // WARNING 3
          if (
            warningNumber === 3
          ) {

            try {

              await target.kick(
                `التحذير الثالث: ${reason}`
              );

            } catch (error) {

              console.log(
                "Kick Error:",
                error
              );

            }

            return interaction.reply({

              content:
                `⚠️ **التحذير الثالث**\n` +
                `👤 العضو: ${target.user.tag}\n` +
                `📌 السبب: ${reason}\n` +
                `👢 تم طرد العضو من السيرفر.`

            });

          }

          // WARNING 4+
          if (
            warningNumber >= 4
          ) {

            try {

              await interaction.guild.members.ban(

                target.id,

                {
                  deleteMessageSeconds: 0,

                  reason:
                    `التحذير الرابع: ${reason}`
                }

              );

            } catch (error) {

              console.log(
                "Ban Error:",
                error
              );

            }

            return interaction.reply({

              content:
                `⚠️ **التحذير الرابع**\n` +
                `👤 العضو: ${target.user.tag}\n` +
                `📌 السبب: ${reason}\n` +
                `🔨 تم حظر العضو.`

            });

          }

        }

        // ===============================================
        // /clear
        // ===============================================

        if (
          interaction.commandName ===
          "clear"
        ) {

          if (
            !isOwner(
              interaction.member
            )
          ) {

            return interaction.reply({

              content:
                "❌ هذا الأمر للمالك فقط.",

              ephemeral: true

            });

          }

          const amount =
            interaction.options.getInteger(
              "amount"
            );

          if (
            !interaction.channel ||
            interaction.channel.type !==
              ChannelType.GuildText
          ) {

            return interaction.reply({

              content:
                "❌ لا يمكن استخدام الأمر هنا.",

              ephemeral: true

            });

          }

          await interaction.deferReply({
            ephemeral: true
          });

          try {

            const botMember =
              interaction.guild.members.me;

            if (
              !botMember
            ) {

              return interaction.editReply({

                content:
                  "❌ لم أستطع العثور على رتبة البوت."

              });

            }

            if (
              !interaction.channel
                .permissionsFor(
                  botMember
                )
                .has(
                  PermissionsBitField.Flags.ManageMessages
                )
            ) {

              return interaction.editReply({

                content:
                  "❌ البوت لا يملك صلاحية **Manage Messages** في هذه القناة."

              });

            }

            const deleted =
              await interaction.channel.bulkDelete(
                amount,
                true
              );

            return interaction.editReply({

              content:
                `🧹 تم حذف **${deleted.size}** رسالة.`

            });

          } catch (error) {

            console.error(
              "❌ Clear Error:",
              error
            );

            return interaction.editReply({

              content:
                "❌ لم أستطع حذف الرسائل.\n" +
                "تأكد أن البوت لديه صلاحية **Manage Messages** وأن الرسائل ليست أقدم من 14 يومًا."

            });

          }

        }

        // ===============================================
        // /setup-ticket
        // ===============================================

        if (
          interaction.commandName ===
          "setup-ticket"
        ) {

          if (
            !isOwner(
              interaction.member
            )
          ) {

            return interaction.reply({

              content:
                "❌ هذا الأمر للمالك فقط.",

              ephemeral: true

            });

          }

          const button =
            new ButtonBuilder()

              .setCustomId(
                "open_ticket"
              )

              .setLabel(
                "فتح تذكرة"
              )

              .setEmoji("🎫")

              .setStyle(
                ButtonStyle.Primary
              );

          const row =
            new ActionRowBuilder()
              .addComponents(
                button
              );

          const embed =
            new EmbedBuilder()

              .setTitle(
                "🎫 الدعم"
              )

              .setDescription(
                "اضغط على الزر لفتح تذكرة مع فريق الإدارة."
              )

              .setColor(
                0x2b2d31
              );

          await interaction.channel.send({

            embeds: [embed],

            components: [row]

          });

          return interaction.reply({

            content:
              "✅ تم إنشاء لوحة التذاكر.",

            ephemeral: true

          });

        }

      }

      // =================================================
      // BUTTONS
      // =================================================

      if (
        interaction.isButton()
      ) {

        // ===============================================
        // OPEN TICKET
        // ===============================================

        if (
          interaction.customId ===
          "open_ticket"
        ) {

          const guild =
            interaction.guild;

          const existingTicket =
            Object.values(
              data.tickets
            ).find(
              ticket =>
                ticket.ownerId ===
                  interaction.user.id &&
                ticket.guildId ===
                  guild.id &&
                ticket.open === true
            );

          if (
            existingTicket
          ) {

            const oldChannel =
              guild.channels.cache.get(
                existingTicket.channelId
              );

            if (
              oldChannel
            ) {

              return interaction.reply({

                content:
                  `❌ لديك تذكرة مفتوحة بالفعل: ${oldChannel}`,

                ephemeral: true

              });

            }

          }

          await interaction.deferReply({
            ephemeral: true
          });

          const permissionOverwrites = [

            {
              id:
                guild.id,

              deny: [
                PermissionsBitField.Flags
                  .ViewChannel
              ]
            },

            {
              id:
                interaction.user.id,

              allow: [

                PermissionsBitField.Flags
                  .ViewChannel,

                PermissionsBitField.Flags
                  .SendMessages,

                PermissionsBitField.Flags
                  .ReadMessageHistory

              ]
            }

          ];

          for (
            const roleId of STAFF_ROLES
          ) {

            permissionOverwrites.push({

              id:
                roleId,

              allow: [

                PermissionsBitField.Flags
                  .ViewChannel,

                PermissionsBitField.Flags
                  .SendMessages,

                PermissionsBitField.Flags
                  .ReadMessageHistory

              ]

            });

          }

          let ticketName =
            interaction.user.username

              .toLowerCase()

              .replace(
                /[^a-z0-9-]/g,
                ""
              )

              .slice(
                0,
                20
              );

          if (
            !ticketName
          ) {

            ticketName =
              "user";

          }

          const channel =
            await guild.channels.create({

              name:
                `ticket-${ticketName}`,

              type:
                ChannelType.GuildText,

              permissionOverwrites

            });

          data.tickets[channel.id] = {

            guildId:
              guild.id,

            channelId:
              channel.id,

            ownerId:
              interaction.user.id,

            claimedBy:
              null,

            claimed:
              false,

            open:
              true,

            createdAt:
              Date.now()

          };

          saveData();

          const closeButton =
            new ButtonBuilder()

              .setCustomId(
                "close_ticket"
              )

              .setLabel(
                "إغلاق التذكرة"
              )

              .setEmoji("🔒")

              .setStyle(
                ButtonStyle.Danger
              );

          const claimButton =
            new ButtonBuilder()

              .setCustomId(
                "claim_ticket"
              )

              .setLabel(
                "استلام التذكرة"
              )

              .setEmoji("🎫")

              .setStyle(
                ButtonStyle.Success
              );

          const row =
            new ActionRowBuilder()
              .addComponents(
                claimButton,
                closeButton
              );

          const staffMention =
            STAFF_ROLES
              .map(
                roleId =>
                  `<@&${roleId}>`
              )
              .join(" ");

          const embed =
            new EmbedBuilder()

              .setTitle(
                "🎫 تذكرة جديدة"
              )

              .setDescription(

                `أهلًا ${interaction.user} 👋\n\n` +

                `تم فتح التذكرة، انتظر أحد أعضاء الإدارة لمساعدتك.\n\n` +

                `🛡️ فريق الإدارة:\n${staffMention}`

              )

              .setColor(
                0x2b2d31
              )

              .setTimestamp();

          await channel.send({

            content:
              `${interaction.user} ${staffMention}`,

            embeds: [
              embed
            ],

            components: [
              row
            ]

          });

          return interaction.editReply({

            content:
              `✅ تم فتح تذكرتك: ${channel}`

          });

        }

        // ===============================================
        // CLAIM TICKET
        // ===============================================

        if (
          interaction.customId ===
          "claim_ticket"
        ) {

          const ticket =
            data.tickets[
              interaction.channel.id
            ];

          if (
            !ticket ||
            !ticket.open
          ) {

            return interaction.reply({

              content:
                "❌ هذه ليست تذكرة مفتوحة.",

              ephemeral: true

            });

          }

          if (
            interaction.user.id ===
            ticket.ownerId
          ) {

            return interaction.reply({

              content:
                "❌ لا يمكنك استلام تذكرتك الخاصة.",

              ephemeral: true

            });

          }

          if (
            !isStaff(
              interaction.member
            )
          ) {

            return interaction.reply({

              content:
                "❌ هذا الزر مخصص للإدارة.",

              ephemeral: true

            });

          }

          if (
            ticket.claimed
          ) {

            return interaction.reply({

              content:
                `❌ تم استلام هذه التذكرة بالفعل بواسطة <@${ticket.claimedBy}>.`,

              ephemeral: true

            });

          }

          ticket.claimed =
            true;

          ticket.claimedBy =
            interaction.user.id;

          // استلام التذكرة = 10 نقاط
          addPoints(
            interaction.user.id,
            10
          );

          saveData();

          const embed =
            new EmbedBuilder()

              .setTitle(
                "🎫 تم استلام التذكرة"
              )

              .setDescription(

                `👤 الموظف: ${interaction.user}\n` +

                `⭐ حصل على **10 نقاط** مقابل استلام التذكرة.`

              )

              .setColor(
                0x2b2d31
              )

              .setTimestamp();

          return interaction.reply({

            embeds: [
              embed
            ]

          });

        }

        // ===============================================
        // CLOSE TICKET
        // ===============================================

        if (
          interaction.customId ===
          "close_ticket"
        ) {

          const ticket =
            data.tickets[
              interaction.channel.id
            ];

          if (
            !ticket ||
            !ticket.open
          ) {

            return interaction.reply({

              content:
                "❌ هذه التذكرة غير موجودة.",

              ephemeral: true

            });

          }

          if (
            interaction.user.id ===
            ticket.ownerId
          ) {

            return interaction.reply({

              content:
                "❌ لا يمكنك إغلاق تذكرتك الخاصة.",

              ephemeral: true

            });

          }

          if (
            !isStaff(
              interaction.member
            )
          ) {

            return interaction.reply({

              content:
                "❌ الإدارة فقط تستطيع إغلاق التذكرة.",

              ephemeral: true

            });

          }

          ticket.open =
            false;

          saveData();

          await interaction.reply({

            content:
              "🔒 سيتم إغلاق التذكرة خلال 3 ثوانٍ."

          });

          setTimeout(
            async () => {

              try {

                await interaction.channel.delete(
                  "إغلاق التذكرة"
                );

              } catch (error) {

                console.log(
                  "Ticket Delete Error:",
                  error
                );

              }

            },
            3000
          );

        }

      }

    } catch (error) {

      console.error(
        "❌ Interaction Error:",
        error
      );

      if (
        interaction.isRepliable() &&
        !interaction.replied &&
        !interaction.deferred
      ) {

        await interaction.reply({

          content:
            "❌ حدث خطأ غير متوقع.",

          ephemeral: true

        }).catch(
          () => {}
        );

      }

    }

  }
);

// =====================================================
// LOGIN
// =====================================================

if (!TOKEN) {

  console.error(
    "❌ TOKEN غير موجود في Environment Variables"
  );

  process.exit(1);

}

client.login(TOKEN);
